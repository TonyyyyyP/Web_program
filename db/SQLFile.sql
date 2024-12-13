USE articlepage;

CREATE TABLE `user`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(15) NOT NULL,
    `dob` DATE NOT NULL,
    `permission` VARCHAR(50) NOT NULL
);

CREATE TABLE `category`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `Name` VARCHAR(255) NOT NULL
);

CREATE TABLE `Tag`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);

CREATE TABLE `article`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `img` BLOB NOT NULL,
    `decription` TEXT NOT NULL,
    `publishedDay` DATE NOT NULL,
    `category_id` BIGINT UNSIGNED NOT NULL,
    `tag_id` BIGINT UNSIGNED NOT NULL
);

CREATE TABLE `faultfinding`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `description` TEXT NOT NULL,
    `accepted` DATE NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `article_id` BIGINT UNSIGNED NOT NULL
);

CREATE TABLE `comment`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `comment` TEXT NOT NULL,
    `publishedDay` DATE NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `article_id` BIGINT UNSIGNED NOT NULL
);

ALTER TABLE
    `faultfinding` ADD CONSTRAINT `faultfinding_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE
    `comment` ADD CONSTRAINT `comment_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `user`(`id`);
ALTER TABLE
    `article` ADD CONSTRAINT `article_tag_id_foreign` FOREIGN KEY(`tag_id`) REFERENCES `Tag`(`id`);
ALTER TABLE
    `comment` ADD CONSTRAINT `comment_article_id_foreign` FOREIGN KEY(`article_id`) REFERENCES `article`(`id`);
ALTER TABLE
    `faultfinding` ADD CONSTRAINT `faultfinding_article_id_foreign` FOREIGN KEY(`article_id`) REFERENCES `article`(`id`);
ALTER TABLE
    `article` ADD CONSTRAINT `article_category_id_foreign` FOREIGN KEY(`category_id`) REFERENCES `category`(`id`);


ALTER TABLE `faultfinding` DROP FOREIGN KEY `faultfinding_user_id_foreign`;
ALTER TABLE `faultfinding` DROP FOREIGN KEY `faultfinding_article_id_foreign`;
ALTER TABLE `comment` DROP FOREIGN KEY `comment_user_id_foreign`;
ALTER TABLE `comment` DROP FOREIGN KEY `comment_article_id_foreign`;
ALTER TABLE `article` DROP FOREIGN KEY `article_tag_id_foreign`;
ALTER TABLE `article` DROP FOREIGN KEY `article_category_id_foreign`;

DROP TABLE IF EXISTS `faultfinding`;
DROP TABLE IF EXISTS `comment`;
DROP TABLE IF EXISTS `article`;
DROP TABLE IF EXISTS `Tag`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `user`;