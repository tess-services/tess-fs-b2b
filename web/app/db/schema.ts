import { sql } from "drizzle-orm";
import { integer, primaryKey, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
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

export const organizationTable = sqliteTable("organization", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  abn: text("abn").notNull(),
  phone: text("phone").notNull(),
  businessAddress: text("address").notNull(),
  invoicePrefix: text("invoice_prefix").notNull().$default(() => 'INV'),
  tradeCurrency: text('trade_currency').notNull(), // Currency (e.g., USD)
  logoUrl: text('logo_url'),
  email: text("email").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
  currentInvoiceNumber: integer("current_invoice_number").notNull().default(0), // Stores the last used number
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

export const businessCategoryTable = sqliteTable("business_category", {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`)
});

export const organizationBusinessCategoryTable = sqliteTable("organization_business_category", {
  organizationId: text("organization_id").notNull().references(() => organizationTable.id),
  businessCategoryId: text("business_category_id").notNull().references(() => businessCategoryTable.id),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`)
}, (table) => ({
  pk: primaryKey({ name: 'organization_business_category_pk', columns: [table.organizationId, table.businessCategoryId] })
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

  addedByUserId: text("added_by_user_id").notNull().references(() => user.id),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),

  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
});

export const customerOrganizationMapping
  = sqliteTable("customer_organization_mapping", {
    customerId: text("customer_id").notNull().references(() => customerTable.id),
    organizationId: text("organization_id").notNull().references(() => organizationTable.id),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`(strftime('%s', 'now'))`,
    ),
  }, (table) => ({
    pk: primaryKey({ name: 'customer_organization_mapping_pk', columns: [table.customerId, table.organizationId] })
  }));

export const invoiceTable = sqliteTable('invoice', {
  id: text("id").primaryKey().$defaultFn(() => nanoid()),
  organizationId: text('organization_id').notNull().references(() => organizationTable.id), // Organization ID
  customerId: text('customer_id').references(() => customerTable.id), // Nullable customer relationship
  invoiceNumber: text("invoice_number").notNull(),       // Full invoice number (e.g., INV00000001)

  customerName: text('customer_name').notNull(),
  customerAddress: text('customer_address').notNull(),
  customerSuburb: text('customer_suburb').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text("phone"),

  date: integer("invoice_date", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
  dueDate: integer("due_date", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
  status: text('status', { enum: ['draft', 'sent', 'paid'] }).notNull().default('draft'),

  sentOn: integer("sent_on", { mode: "timestamp" }),
  paidOn: integer("paid_on", { mode: "timestamp" }),

  totalAmount: real('total_amount').notNull(), // Total invoice amount
  currency: text('currency').notNull(), // Currency (e.g., USD)
  notes: text('notes'), // Additional notes

  generatedByUserId: text('generated_by_user_id').notNull().references(() => user.id),

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
});

// InvoiceDetail Table with Discount, GST, and Product/Service Relationships
export const invoiceDetailTable = sqliteTable('invoice_detail', {
  id: text("id").$defaultFn(() => nanoid()),

  invoiceId: text('invoice_id').references(() => invoiceTable.id), // Foreign key to Invoice table
  productId: integer('product_id'), // Nullable reference to Product
  serviceId: integer('service_id'), // Nullable reference to Service

  description: text('description'), // Ad-hoc description of product/service

  quantity: real('quantity').notNull(), // Quantity of the product/service
  unitPrice: real('unit_price').notNull(), // Price per unit
  discount: real('discount'), // Nullable discount field
  gstRate: real('gst_rate'), // Nullable GST rate (%)
  amount: real('amount').notNull(), // Total price (calculated after applying discount and GST)

  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`),

  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`,
  ).notNull(),
}, (table) => ({
  pk: primaryKey({ name: 'invoice_detail_pk', columns: [table.invoiceId, table.id] })
}));
