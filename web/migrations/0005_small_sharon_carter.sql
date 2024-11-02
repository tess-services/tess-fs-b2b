CREATE TABLE `business_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `invoice_detail` (
	`id` text,
	`invoice_id` text,
	`product_id` integer,
	`service_id` integer,
	`description` text,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`discount` real,
	`gst_rate` real,
	`amount` real NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	PRIMARY KEY(`invoice_id`, `id`),
	FOREIGN KEY (`invoice_id`) REFERENCES `invoice`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invoice` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`customer_id` text,
	`invoice_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`customer_address` text NOT NULL,
	`customer_suburb` text NOT NULL,
	`customer_email` text NOT NULL,
	`phone` text,
	`invoice_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`due_date` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`sent_on` integer,
	`paid_on` integer,
	`total_amount` real NOT NULL,
	`currency` text NOT NULL,
	`notes` text,
	`generated_by_user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`generated_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organization_business_category` (
	`organization_id` text NOT NULL,
	`business_category_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	PRIMARY KEY(`organization_id`, `business_category_id`),
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`business_category_id`) REFERENCES `business_category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`abn` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`invoice_prefix` text NOT NULL,
	`trade_currency` text NOT NULL,
	`logo_url` text,
	`email` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	`current_invoice_number` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_organization` (
	`user_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`is_owner` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	PRIMARY KEY(`user_id`, `organization_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`first_name` text NOT NULL,
	`last_name` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`suburb` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
