import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";
import type { OrganizationMetadata } from "~/lib/organization";

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(false),
  image: text("image"), // user's image url

  role: text("role"), // this should be set as "admin" for superadmin like us the SaaS provider.
  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const session = sqliteTable("session", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  userId: text("userId").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),

  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  token: text("token"),
  activeOrganizationId: text("activeOrganizationId"),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const account = sqliteTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => user.id),

  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  acessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: integer("expiresAt", { mode: "timestamp" }),
  password: text("password"), // password for email/password provider - hashed

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const verification = sqliteTable("verification", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const organizationTable = sqliteTable("organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logo: text("logo"),
  metadata: text("metadata", { mode: "json" }).$type<OrganizationMetadata>(),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});

// There will be many to many relationship between user and organization,
// so we need a join table to represent this relationship.
export const organizationMembership = sqliteTable("member", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizationTable.id),
  role: text("role").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});

export const userProfileTable = sqliteTable("userProfile", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  userId: text("userId")
    .notNull()
    .references(() => user.id),

  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  suburb: text("suburb"),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});

export const customerTable = sqliteTable("customer", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),

  name: text("name").notNull(),
  address: text("address"),
  suburb: text("suburb"),
  phone: text("phone"),
  email: text("email").notNull(),
  organizationId: text("organizationId")
    .notNull()
    .references(() => organizationTable.id),

  addedByUserId: text("addedByUserId")
    .notNull()
    .references(() => user.id),

  createdAt: integer("createdAt", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),

  updatedAt: integer("updatedAt", { mode: "timestamp" })
    .default(sql`(strftime('%s', 'now'))`)
    .notNull(),
});

export const invitation = sqliteTable("invitation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => nanoid()),
  inviterId: text("inviterId")
    .notNull()
    .references(() => user.id),

  email: text("email").notNull(),
  organizationId: text("organizationId").notNull(),
  role: text("role").notNull(),

  status: text("status").notNull(),

  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export const imageFileMetadata = sqliteTable("imageFileMetadata", {
  id: text("id").primaryKey(), // id of the image in image storage.

  uploadedByUserId: text("uploadedByUserId")
    .notNull()
    .references(() => user.id),
  organizationId: text("organizationId").references(() => organizationTable.id),

  attachedEntityType: text("attachedEntityType"),
  attachedEntityId: text("attachedEntityId"),

  createdAt: integer("createdAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});
