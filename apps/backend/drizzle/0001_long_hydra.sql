CREATE TABLE `memos` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `content` text NOT NULL,
    `isPublished` integer DEFAULT false NOT NULL,
    `authorId` integer,
    `deletedAt` integer,
    `createdAt` integer DEFAULT (unixepoch()) NOT NULL,
    `updatedAt` integer DEFAULT (unixepoch()) NOT NULL,
    FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);

INSERT INTO `memos` (`content`, `isPublished`, `authorId`, `createdAt`, `updatedAt`)
SELECT `content`, `isPublished`, `authorId`, `createdAt`, `updatedAt`
FROM `posts`
WHERE `type` = 'memo';

--> statement-breakpoint

DELETE FROM `posts` WHERE `type` = 'memo';

ALTER TABLE `posts` DROP COLUMN `type`;