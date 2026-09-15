-- CreateTable
CREATE TABLE `posts` (
    `id` VARCHAR(40) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `legacy_slug` VARCHAR(191) NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `excerpt` TEXT NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `title_en` VARCHAR(255) NOT NULL DEFAULT '',
    `excerpt_en` TEXT NOT NULL,
    `body_en` MEDIUMTEXT NOT NULL,
    `title_fr` VARCHAR(255) NOT NULL DEFAULT '',
    `excerpt_fr` TEXT NOT NULL,
    `body_fr` MEDIUMTEXT NOT NULL,
    `category` VARCHAR(64) NOT NULL DEFAULT 'motorcycle',
    `tags` VARCHAR(255) NOT NULL DEFAULT '',
    `image` VARCHAR(255) NOT NULL DEFAULT '',
    `status` ENUM('draft', 'published', 'scheduled') NOT NULL DEFAULT 'draft',
    `reads` INTEGER NOT NULL DEFAULT 0,
    `date` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `published_at` DATETIME(3) NULL,
    `scheduled_at` DATETIME(3) NULL,
    `source_name` VARCHAR(191) NOT NULL DEFAULT '',
    `source_url` VARCHAR(500) NOT NULL DEFAULT '',

    UNIQUE INDEX `posts_slug_key`(`slug`),
    INDEX `posts_status_published_at_idx`(`status`, `published_at`),
    INDEX `posts_category_idx`(`category`),
    INDEX `posts_legacy_slug_idx`(`legacy_slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pages` (
    `id` VARCHAR(40) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `body` MEDIUMTEXT NOT NULL,
    `menu_order` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pages_slug_key`(`slug`),
    INDEX `pages_published_menu_order_idx`(`published`, `menu_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ads` (
    `id` VARCHAR(40) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `cta_label` VARCHAR(120) NOT NULL DEFAULT '',
    `target_url` VARCHAR(500) NOT NULL DEFAULT '',
    `image_url` VARCHAR(500) NOT NULL DEFAULT '',
    `language` VARCHAR(5) NOT NULL DEFAULT 'en',
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ads_active_language_idx`(`active`, `language`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletters` (
    `id` VARCHAR(40) NOT NULL,
    `issue_number` INTEGER NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `preview_text` VARCHAR(255) NOT NULL DEFAULT '',
    `content` MEDIUMTEXT NOT NULL,
    `status` ENUM('draft', 'scheduled', 'sent') NOT NULL DEFAULT 'draft',
    `scheduled_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `recipient_count` INTEGER NOT NULL DEFAULT 0,
    `open_count` INTEGER NOT NULL DEFAULT 0,
    `click_count` INTEGER NOT NULL DEFAULT 0,
    `unsubscribe_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `newsletters_issue_number_key`(`issue_number`),
    INDEX `newsletters_status_created_at_idx`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscribers` (
    `id` VARCHAR(40) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `status` ENUM('pending', 'active', 'unsubscribed') NOT NULL DEFAULT 'active',
    `source` VARCHAR(64) NOT NULL DEFAULT 'Web sitesi',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subscribers_email_key`(`email`),
    INDEX `subscribers_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `site_name` VARCHAR(120) NOT NULL DEFAULT 'motorvoix',
    `domain` VARCHAR(191) NOT NULL DEFAULT '',
    `description` TEXT NOT NULL,
    `description_en` TEXT NOT NULL,
    `contact_email` VARCHAR(191) NOT NULL DEFAULT '',
    `language` VARCHAR(5) NOT NULL DEFAULT 'en',
    `feed_layout` VARCHAR(20) NOT NULL DEFAULT 'card',
    `posts_per_page` INTEGER NOT NULL DEFAULT 8,
    `newsletter_enabled` BOOLEAN NOT NULL DEFAULT true,
    `newsletter_title` VARCHAR(255) NOT NULL DEFAULT '',
    `newsletter_description` TEXT NOT NULL,
    `show_subscriber_count` BOOLEAN NOT NULL DEFAULT true,
    `maintenance_mode` BOOLEAN NOT NULL DEFAULT false,
    `module_posts` BOOLEAN NOT NULL DEFAULT true,
    `module_newsletter` BOOLEAN NOT NULL DEFAULT true,
    `module_ads` BOOLEAN NOT NULL DEFAULT true,
    `module_analytics` BOOLEAN NOT NULL DEFAULT true,
    `module_themes` BOOLEAN NOT NULL DEFAULT false,
    `admin_name` VARCHAR(191) NOT NULL DEFAULT '',
    `admin_email` VARCHAR(191) NOT NULL DEFAULT '',
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(40) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `password_hash` VARCHAR(255) NOT NULL,
    `role` VARCHAR(20) NOT NULL DEFAULT 'admin',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_daily` (
    `date` DATE NOT NULL,
    `pageviews` INTEGER NOT NULL DEFAULT 0,
    `visitors` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`date`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_breakdown` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kind` VARCHAR(20) NOT NULL,
    `code` VARCHAR(40) NOT NULL DEFAULT '',
    `label` VARCHAR(120) NOT NULL,
    `percentage` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `analytics_breakdown_kind_idx`(`kind`),
    UNIQUE INDEX `analytics_breakdown_kind_label_key`(`kind`, `label`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `analytics_top_pages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `path` VARCHAR(255) NOT NULL,
    `pageviews` INTEGER NOT NULL DEFAULT 0,
    `visitors` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `analytics_top_pages_path_key`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_feedback` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` VARCHAR(40) NOT NULL,
    `vote` VARCHAR(10) NOT NULL,
    `visitor_key` VARCHAR(64) NOT NULL DEFAULT '',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `post_feedback_post_id_idx`(`post_id`),
    UNIQUE INDEX `post_feedback_post_id_visitor_key_key`(`post_id`, `visitor_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `post_feedback` ADD CONSTRAINT `post_feedback_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
