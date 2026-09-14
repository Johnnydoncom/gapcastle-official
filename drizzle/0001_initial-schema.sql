CREATE TABLE `admin_users` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(160) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('admin','editor') NOT NULL DEFAULT 'admin',
	`is_active` tinyint NOT NULL DEFAULT 1,
	`last_login_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_admin_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(200) NOT NULL,
	`excerpt` varchar(400),
	`content` mediumtext NOT NULL,
	`category` varchar(60) NOT NULL DEFAULT 'News',
	`cover_image` varchar(255),
	`cover_alt` varchar(255),
	`author_id` int unsigned,
	`author_name` varchar(120),
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`is_featured` tinyint NOT NULL DEFAULT 0,
	`reading_minutes` tinyint unsigned NOT NULL DEFAULT 1,
	`seo_title` varchar(200),
	`seo_description` varchar(320),
	`published_at` datetime,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_blog_slug` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`reference` varchar(20) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`topic` enum('general','school','travel','personal','business','advisory','large_financing','bills','fun_food') NOT NULL DEFAULT 'general',
	`subject` varchar(160),
	`message` text NOT NULL,
	`preferred_contact` enum('phone','email','whatsapp') NOT NULL DEFAULT 'phone',
	`status` enum('new','read','replied','archived') NOT NULL DEFAULT 'new',
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contact_messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_contact_reference` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `email_log` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`event` varchar(60) NOT NULL,
	`reference` varchar(20),
	`recipient` varchar(500) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` enum('sent','failed','skipped') NOT NULL,
	`error` varchar(1000),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fun_food_donations` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`reference` varchar(20) NOT NULL,
	`name` varchar(120) NOT NULL,
	`email` varchar(160) NOT NULL,
	`phone` varchar(32),
	`donation_type` enum('cash','food') NOT NULL,
	`amount` decimal(14,2),
	`food_items` varchar(255),
	`note` varchar(600),
	`status` enum('pledged','received','acknowledged') NOT NULL DEFAULT 'pledged',
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fun_food_donations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_ffd_reference` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `fun_food_registrations` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`reference` varchar(20) NOT NULL,
	`surname` varchar(80) NOT NULL,
	`first_name` varchar(80) NOT NULL,
	`middle_name` varchar(80),
	`phone` varchar(32) NOT NULL,
	`email` varchar(160),
	`date_of_birth` date NOT NULL,
	`home_address` varchar(255) NOT NULL,
	`marital_status` enum('single','married','divorced','widow','widower'),
	`number_of_children` tinyint unsigned,
	`employment_type` enum('employee','self_employed','unemployed','student'),
	`place_of_work` varchar(160),
	`line_of_business` varchar(160),
	`work_address` varchar(255),
	`status` enum('registered','confirmed','attended','cancelled') NOT NULL DEFAULT 'registered',
	`ip_address` varchar(45),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fun_food_registrations_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_ffr_reference` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `loan_applications` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`reference` varchar(20) NOT NULL,
	`loan_type` enum('school','travel','personal','business') NOT NULL,
	`application_type` enum('individual','corporate') NOT NULL DEFAULT 'individual',
	`surname` varchar(80) NOT NULL,
	`first_name` varchar(80) NOT NULL,
	`middle_name` varchar(80),
	`email` varchar(160) NOT NULL,
	`phone` varchar(32) NOT NULL,
	`date_of_birth` date NOT NULL,
	`home_address` varchar(255) NOT NULL,
	`office_address` varchar(255),
	`business_name` varchar(160),
	`business_registered` tinyint,
	`business_registration_date` date,
	`loan_amount` decimal(14,2) NOT NULL,
	`loan_purpose` varchar(600) NOT NULL,
	`repayment_months` tinyint unsigned,
	`school_name` varchar(160),
	`number_of_children` tinyint unsigned,
	`travel_destination` varchar(120),
	`travel_date` date,
	`travel_purpose` enum('study','business','tourism','medical','family','other'),
	`employer` varchar(160),
	`monthly_income` decimal(14,2),
	`status` enum('new','reviewing','approved','declined','disbursed') NOT NULL DEFAULT 'new',
	`admin_notes` text,
	`consent` tinyint NOT NULL DEFAULT 0,
	`ip_address` varchar(45),
	`user_agent` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loan_applications_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_loan_reference` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`filename` varchar(200) NOT NULL,
	`mime_type` varchar(60) NOT NULL,
	`byte_size` int unsigned NOT NULL,
	`data` mediumblob NOT NULL,
	`uploaded_by` int unsigned,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`email` varchar(160) NOT NULL,
	`source` varchar(40) NOT NULL DEFAULT 'website',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscribers_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_newsletter_email` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`bucket` varchar(191) NOT NULL,
	`hits` int unsigned NOT NULL DEFAULT 0,
	`window_start` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rate_limits_bucket` PRIMARY KEY(`bucket`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_setting_key` PRIMARY KEY(`setting_key`)
);
--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_admin_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `admin_users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_blog_status_published` ON `blog_posts` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `idx_blog_category` ON `blog_posts` (`category`);--> statement-breakpoint
CREATE INDEX `idx_contact_status` ON `contact_messages` (`status`);--> statement-breakpoint
CREATE INDEX `idx_contact_created` ON `contact_messages` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email_created` ON `email_log` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_email_status` ON `email_log` (`status`);--> statement-breakpoint
CREATE INDEX `idx_ffd_created` ON `fun_food_donations` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_ffr_created` ON `fun_food_registrations` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_ffr_phone` ON `fun_food_registrations` (`phone`);--> statement-breakpoint
CREATE INDEX `idx_loan_type` ON `loan_applications` (`loan_type`);--> statement-breakpoint
CREATE INDEX `idx_loan_status` ON `loan_applications` (`status`);--> statement-breakpoint
CREATE INDEX `idx_loan_created` ON `loan_applications` (`created_at`);--> statement-breakpoint
CREATE INDEX `idx_loan_email` ON `loan_applications` (`email`);--> statement-breakpoint
CREATE INDEX `idx_media_created` ON `media` (`created_at`);