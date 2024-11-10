CREATE TABLE `customer_organization_mapping` (
	`customer_id` text NOT NULL,
	`organization_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')),
	PRIMARY KEY(`customer_id`, `organization_id`),
	FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organization_id`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- DROP TABLE `customer_user_mapping`;