ALTER TABLE `organization` RENAME COLUMN "logo" TO "logoFileId";--> statement-breakpoint
ALTER TABLE `imageFileMetadata` ADD `name` text NOT NULL;--> statement-breakpoint
ALTER TABLE `imageFileMetadata` ADD `imageCategory` text;