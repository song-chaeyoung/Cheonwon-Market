export type ServerEnv = {
  DATABASE_URL: string;
  MARKET_ENTRY_CODE: string;
  MARKET_ACCESS_COOKIE_SECRET: string;
  BLOB_READ_WRITE_TOKEN: string;
};

const REQUIRED_ENV_KEYS = [
  "DATABASE_URL",
  "MARKET_ENTRY_CODE",
  "MARKET_ACCESS_COOKIE_SECRET",
  "BLOB_READ_WRITE_TOKEN",
] as const;

export function getEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !source[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return {
    DATABASE_URL: source.DATABASE_URL!,
    MARKET_ENTRY_CODE: source.MARKET_ENTRY_CODE!,
    MARKET_ACCESS_COOKIE_SECRET: source.MARKET_ACCESS_COOKIE_SECRET!,
    BLOB_READ_WRITE_TOKEN: source.BLOB_READ_WRITE_TOKEN!,
  };
}
