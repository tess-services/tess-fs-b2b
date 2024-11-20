import { sql } from "drizzle-orm";
import { integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

export const imageFileMetadata = sqliteTable("image_file_metadata", {
  id: text("id").primaryKey(), // id of the image in image storage.

  uploadedByUserId: text("user_id").notNull().references(() => user.id),
  organizationId: text("organization_id").references(() => organizationTable.id),

  attachedEntityType: text("attached_entity_type"),
  attachedEntityId: text("attached_entity_id"),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
});

export const organizationTable = sqliteTable("organization", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  abn: text("abn").notNull(),
  phone: text("phone").notNull(),
  businessAddress: text("address").notNull(),
  tradeCurrency: text('trade_currency').notNull(), // Currency (e.g., USD)
  logoUrl: text('logo_url'),
  email: text("email").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
});

// There will be many to many relationship between user and organization,
// so we need a join table to represent this relationship.
export const userOrganizationTable = sqliteTable("user_organization", {
  userId: text("user_id").notNull().references(() => user.id),
  organizationId: text("organization_id").notNull().references(() => organizationTable.id),
  isOwner: integer("is_owner", { mode: 'boolean' }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`)
}, (table) => ({
  pk: primaryKey({ name: 'user_organization_pk', columns: [table.userId, table.organizationId] })
}));

export const userProfileTable = sqliteTable("user_profile", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  userId: text("user_id").notNull().references(() => user.id),

  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  suburb: text("suburb"),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
});

export const customerTable = sqliteTable("customer", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),

  name: text("name").notNull(),
  address: text("address"),
  suburb: text("suburb"),
  phone: text("phone"),
  email: text("email").notNull(),
  isCommercial: integer("is_commercial", { mode: "boolean" }).default(false),
  organizationId: text("organization_id").notNull().references(() => organizationTable.id),

  addedByUserId: text("added_by_user_id").notNull().references(() => user.id),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),

  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
});
