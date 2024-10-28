import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from 'nanoid';

export const user = sqliteTable("user", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),

  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(false),
  image: text("image"), // user's image url

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),

  userId: text("userId").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),

  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("userId").notNull().references(() => user.id),

  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  acessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  password: text("password"), // password for email/password provider - hashed

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),

  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const customerTable = sqliteTable("customer", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),

  name: text("name").notNull(),
  address: text("address"),
  suburb: text("suburb"),
  phone: text("phone"),
  email: text("email").notNull(),
  isCommercial: integer("is_commercial", { mode: "boolean" }).default(false),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});
