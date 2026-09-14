-- Staff accounts: admin_users → users, password_hash → password (bcrypt),
-- password reset tokens, and sessions that end when a password changes.
RENAME TABLE `admin_users` TO `users`;--> statement-breakpoint
ALTER TABLE `users` CHANGE COLUMN `password_hash` `password` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','editor') NOT NULL DEFAULT 'editor';--> statement-breakpoint
ALTER TABLE `users` ADD COLUMN `password_changed_at` datetime AFTER `last_login_at`;--> statement-breakpoint
ALTER TABLE `users` RENAME INDEX `uq_admin_email` TO `uq_users_email`;--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned NOT NULL,
	`token_hash` char(64) NOT NULL,
	`expires_at` datetime NOT NULL,
	`used_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_reset_token_hash` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE INDEX `idx_reset_user` ON `password_reset_tokens` (`user_id`);--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

-- Blog categories become their own table.
CREATE TABLE `categories` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` varchar(300),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_categories_name` UNIQUE(`name`),
	CONSTRAINT `uq_categories_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
INSERT INTO `categories` (`name`, `slug`)
	SELECT DISTINCT TRIM(`category`), LOWER(REPLACE(TRIM(`category`), ' ', '-')) FROM `blog_posts`;--> statement-breakpoint

-- blog_posts → posts, linked to categories, users and media by id.
RENAME TABLE `blog_posts` TO `posts`;--> statement-breakpoint
ALTER TABLE `posts` DROP FOREIGN KEY `blog_posts_author_id_admin_users_id_fk`;--> statement-breakpoint
ALTER TABLE `posts` ADD COLUMN `category_id` int unsigned AFTER `id`, ADD COLUMN `cover_image_id` int unsigned AFTER `author_id`;--> statement-breakpoint
UPDATE `posts` p INNER JOIN `categories` c ON c.`name` = TRIM(p.`category`) SET p.`category_id` = c.`id`;--> statement-breakpoint
UPDATE `posts` p INNER JOIN `media` m ON p.`cover_image` = CONCAT('/media/', m.`id`) SET p.`cover_image_id` = m.`id`;--> statement-breakpoint
ALTER TABLE `posts` MODIFY COLUMN `category_id` int unsigned NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` DROP INDEX `idx_blog_category`;--> statement-breakpoint
ALTER TABLE `posts` DROP COLUMN `category`, DROP COLUMN `cover_image`, DROP COLUMN `author_name`, DROP COLUMN `reading_minutes`;--> statement-breakpoint
ALTER TABLE `posts` RENAME INDEX `uq_blog_slug` TO `uq_posts_slug`, RENAME INDEX `idx_blog_status_published` TO `idx_posts_status_published`, RENAME INDEX `blog_posts_author_id_admin_users_id_fk` TO `idx_posts_author`;--> statement-breakpoint
CREATE INDEX `idx_posts_category` ON `posts` (`category_id`);--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_category_id_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `posts` ADD CONSTRAINT `posts_cover_image_id_media_id_fk` FOREIGN KEY (`cover_image_id`) REFERENCES `media`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- Uploads remember who added them.
UPDATE `media` m LEFT JOIN `users` u ON u.`id` = m.`uploaded_by` SET m.`uploaded_by` = NULL WHERE m.`uploaded_by` IS NOT NULL AND u.`id` IS NULL;--> statement-breakpoint
ALTER TABLE `media` ADD CONSTRAINT `media_uploaded_by_users_id_fk` FOREIGN KEY (`uploaded_by`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;
