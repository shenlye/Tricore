CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`link` text NOT NULL,
	`avatar` text,
	`desc` text,
	`date` integer,
	`feed` text,
	`comment` text,
	`category` text,
	`createdAt` integer DEFAULT (unixepoch()) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `linksCreatedAtIdx` ON `links` (`createdAt`);