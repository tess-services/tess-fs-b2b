PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_customer` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`suburb` text,
	`phone` text,
	`email` text NOT NULL,
	`is_commercial` integer DEFAULT false,
	`added_by_user_id` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`added_by_user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_customer`("id", "name", "address", "suburb", "phone", "email", "is_commercial", "added_by_user_id", "created_at", "updated_at") SELECT "id", "name", "address", "suburb", "phone", "email", "is_commercial", "added_by_user_id", "created_at", "updated_at" FROM `customer`;--> statement-breakpoint
DROP TABLE `customer`;--> statement-breakpoint
ALTER TABLE `__new_customer` RENAME TO `customer`;--> statement-breakpoint
PRAGMA foreign_keys=ON;