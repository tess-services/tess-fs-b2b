import type { DrizzleD1Database } from "drizzle-orm/d1";
import { getContext } from 'hono/context-storage';
import { AsyncLocalStorage } from "node:async_hooks";

import { HonoEnv } from "server";
import * as schema from "./schema";

export const DatabaseContext = new AsyncLocalStorage<
  DrizzleD1Database<typeof schema>
>();

export function database() {
  const db = getContext<HonoEnv>().var.db;

  if (!db) {
    console.trace();
    console.error("=====> DatabaseContext not set");
    throw new Error("DatabaseContext not set");
  }

  return db;
}
