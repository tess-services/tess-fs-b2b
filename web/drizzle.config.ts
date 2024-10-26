import type { Config } from "drizzle-kit";

export default {
  schema: "./app/db",
  out: "./migrations",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    databaseId: process.env.DATABASE_ID,
    accountId: process.env.ACCOUNT_ID,
    token: process.env.DATABASE_TOKEN,
  },
} satisfies Config;
