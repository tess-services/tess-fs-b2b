CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`accountId` text NOT NULL,
	`providerId` text NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` integer,
	`password` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`suburb` text,
	`phone` text,
	`email` text NOT NULL,
	`organizationId` text NOT NULL,
	`addedByUserId` text NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`addedByUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `imageFileMetadata` (
	`id` text PRIMARY KEY NOT NULL,
	`uploadedByUserId` text NOT NULL,
	`organizationId` text,
	`attachedEntityType` text,
	`attachedEntityId` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now')),
	FOREIGN KEY (`uploadedByUserId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `invitation` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`organizationId` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `organization` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`logo` text,
	`metadata` text,
	`abn` text,
	`phone` text,
	`address` text,
	`tradeCurrency` text,
	`email` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`ipAddress` text,
	`userAgent` text,
	`token` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false,
	`image` text,
	`isSuperAdmin` integer DEFAULT false,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now'))
);
--> statement-breakpoint
CREATE TABLE `member` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`organizationId` text NOT NULL,
	`role` text NOT NULL,
	`isOwner` integer DEFAULT false NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`organizationId`) REFERENCES `organization`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `userProfile` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`phone` text NOT NULL,
	`address` text NOT NULL,
	`suburb` text,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`createdAt` integer DEFAULT (strftime('%s', 'now')),
	`updatedAt` integer DEFAULT (strftime('%s', 'now'))
);
