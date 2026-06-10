import { neon } from "@neondatabase/serverless";

import { getEnv } from "./env";

let sql: ReturnType<typeof neon> | null = null;

export function getSql(): ReturnType<typeof neon> {
  if (!sql) {
    sql = neon(getEnv().DATABASE_URL);
  }

  return sql;
}
