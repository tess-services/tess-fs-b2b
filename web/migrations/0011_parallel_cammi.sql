ALTER TABLE `customer` ADD `organization_id` text NOT NULL REFERENCES organization(id);--> statement-breakpoint
ALTER TABLE `customer` ADD `added_by_user_id` text NOT NULL REFERENCES user(id);