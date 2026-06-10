import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, "..");
const MIGRATIONS_DIR = path.join(REPO_ROOT, "db", "migrations");
const ENV_FILES = [".env", ".env.local"];

function usage() {
  console.log(`Usage: pnpm db:migrate [--dry-run]

Applies SQL files from db/migrations to DATABASE_URL.
Environment variables are loaded from .env, then .env.local.
Shell environment variables take precedence over files.`);
}

function parseEnvLine(line) {
  let trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  if (trimmed.startsWith("export ")) {
    trimmed = trimmed.slice("export ".length).trim();
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
    return null;
  }

  let value = trimmed.slice(separatorIndex + 1).trim();
  const quote = value[0];

  if ((quote === `"` || quote === `'`) && value.endsWith(quote)) {
    value = value.slice(1, -1);

    if (quote === `"`) {
      value = value
        .replaceAll("\\n", "\n")
        .replaceAll("\\r", "\r")
        .replaceAll("\\t", "\t")
        .replaceAll('\\"', '"')
        .replaceAll("\\\\", "\\");
    }
  } else {
    const inlineCommentIndex = value.search(/\s#/);

    if (inlineCommentIndex !== -1) {
      value = value.slice(0, inlineCommentIndex).trim();
    }
  }

  return [key, value];
}

async function loadEnvFiles() {
  const protectedKeys = new Set(
    Object.entries(process.env)
      .filter(([, value]) => value !== undefined && value !== "")
      .map(([key]) => key),
  );
  const loadedFiles = [];

  for (const envFile of ENV_FILES) {
    const envPath = path.join(REPO_ROOT, envFile);
    let content;

    try {
      content = await readFile(envPath, "utf8");
    } catch (error) {
      if (error && error.code === "ENOENT") {
        continue;
      }

      throw error;
    }

    loadedFiles.push(envFile);

    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);

      if (!parsed) {
        continue;
      }

      const [key, value] = parsed;

      if (!protectedKeys.has(key)) {
        process.env[key] = value;
      }
    }
  }

  return loadedFiles;
}

function splitSqlStatements(sqlText) {
  const statements = [];
  let current = "";
  let singleQuoted = false;
  let doubleQuoted = false;
  let lineComment = false;
  let blockComment = false;
  let dollarQuoteTag = null;

  for (let index = 0; index < sqlText.length; index += 1) {
    const char = sqlText[index];
    const next = sqlText[index + 1];
    const rest = sqlText.slice(index);

    if (lineComment) {
      current += char;

      if (char === "\n") {
        lineComment = false;
      }

      continue;
    }

    if (blockComment) {
      current += char;

      if (char === "*" && next === "/") {
        current += next;
        index += 1;
        blockComment = false;
      }

      continue;
    }

    if (dollarQuoteTag) {
      if (rest.startsWith(dollarQuoteTag)) {
        current += dollarQuoteTag;
        index += dollarQuoteTag.length - 1;
        dollarQuoteTag = null;
      } else {
        current += char;
      }

      continue;
    }

    if (!singleQuoted && !doubleQuoted && char === "-" && next === "-") {
      current += char + next;
      index += 1;
      lineComment = true;
      continue;
    }

    if (!singleQuoted && !doubleQuoted && char === "/" && next === "*") {
      current += char + next;
      index += 1;
      blockComment = true;
      continue;
    }

    if (!singleQuoted && !doubleQuoted && char === "$") {
      const match = rest.match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/);

      if (match) {
        dollarQuoteTag = match[0];
        current += dollarQuoteTag;
        index += dollarQuoteTag.length - 1;
        continue;
      }
    }

    current += char;

    if (!doubleQuoted && char === "'" && next === "'") {
      current += next;
      index += 1;
      continue;
    }

    if (!singleQuoted && char === `"`) {
      doubleQuoted = !doubleQuoted;
      continue;
    }

    if (!doubleQuoted && char === "'") {
      singleQuoted = !singleQuoted;
      continue;
    }

    if (!singleQuoted && !doubleQuoted && char === ";") {
      const statement = current.trim();

      if (statement) {
        statements.push(statement);
      }

      current = "";
    }
  }

  const finalStatement = current.trim();

  if (finalStatement) {
    statements.push(finalStatement);
  }

  return statements;
}

async function listMigrationFiles() {
  const entries = await readdir(MIGRATIONS_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((first, second) => first.localeCompare(second));
}

async function ensureMigrationTable(sql) {
  await sql.query(`
    create table if not exists schema_migrations (
      filename text primary key,
      applied_at timestamptz not null default now()
    )
  `);
}

async function getAppliedMigrations(sql, { dryRun }) {
  if (dryRun) {
    const tableRows = await sql.query(
      "select to_regclass('public.schema_migrations') as table_name",
    );

    if (!tableRows[0]?.table_name) {
      return new Set();
    }
  } else {
    await ensureMigrationTable(sql);
  }

  const rows = await sql.query("select filename from schema_migrations");

  return new Set(rows.map((row) => row.filename));
}

async function applyMigration(sql, filename) {
  const migrationPath = path.join(MIGRATIONS_DIR, filename);
  const migrationSql = await readFile(migrationPath, "utf8");
  const statements = splitSqlStatements(migrationSql);

  await sql.transaction((txn) => [
    ...statements.map((statement) => txn`${txn.unsafe(statement)}`),
    txn`insert into schema_migrations (filename) values (${filename})`,
  ]);
}

function formatError(error) {
  if (error instanceof Error) {
    return error.stack ?? error.message;
  }

  return String(error);
}

async function main() {
  const args = new Set(process.argv.slice(2));

  if (args.has("--help") || args.has("-h")) {
    usage();
    return;
  }

  const supportedArgs = new Set(["--dry-run"]);
  const unknownArgs = [...args].filter((arg) => !supportedArgs.has(arg));

  if (unknownArgs.length > 0) {
    throw new Error(`Unknown argument: ${unknownArgs.join(", ")}`);
  }

  const dryRun = args.has("--dry-run");
  const loadedEnvFiles = await loadEnvFiles();
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error(
      "Missing DATABASE_URL. Copy .env.example to .env.local and fill DATABASE_URL first.",
    );
  }

  if (loadedEnvFiles.length > 0) {
    console.log(`Loaded env files: ${loadedEnvFiles.join(", ")}`);
  }

  const sql = neon(databaseUrl);
  const migrationFiles = await listMigrationFiles();
  const appliedMigrations = await getAppliedMigrations(sql, { dryRun });
  const pendingMigrations = migrationFiles.filter(
    (filename) => !appliedMigrations.has(filename),
  );

  if (pendingMigrations.length === 0) {
    console.log("No pending migrations.");
    return;
  }

  if (dryRun) {
    console.log("Pending migrations:");
    for (const filename of pendingMigrations) {
      console.log(`- ${filename}`);
    }
    return;
  }

  for (const filename of pendingMigrations) {
    console.log(`Applying ${filename}...`);
    await applyMigration(sql, filename);
    console.log(`Applied ${filename}`);
  }

  console.log("Database migrations completed.");
}

main().catch((error) => {
  console.error(formatError(error));
  process.exitCode = 1;
});
