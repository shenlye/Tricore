CREATE TABLE `post_links` (
	`sourcePostId` integer NOT NULL,
	`targetPostId` integer NOT NULL,
	`context` text,
	PRIMARY KEY(`sourcePostId`, `targetPostId`),
	FOREIGN KEY (`sourcePostId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`targetPostId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `growthStage` text DEFAULT 'seed';--> statement-breakpoint
ALTER TABLE `posts` ADD `isPinned` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `posts` ADD `backlinksCount` integer DEFAULT 0;