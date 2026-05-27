-- CreateTable
CREATE TABLE `positive_effects` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `positive_effects_label_key`(`label`),
    UNIQUE INDEX `positive_effects_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `reports` ADD COLUMN `bought` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `consumed` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `information_source` ENUM('VENDOR', 'POSTER', 'DISPLAY', 'PRODUCT_LABEL', 'WEBSITE', 'WORD_OF_MOUTH', 'OTHER') NULL,
    ADD COLUMN `reason_not_bought` TEXT NULL,
    ADD COLUMN `reason_not_consumed` TEXT NULL,
    ADD COLUMN `effects_match_claim` ENUM('EXACT', 'PARTIAL', 'NONE', 'NO_CLAIM_RECEIVED') NULL,
    ADD COLUMN `approximate_period` VARCHAR(191) NULL,
    ADD COLUMN `effect_duration` VARCHAR(191) NULL,
    ADD COLUMN `withdrawal_symptoms` TEXT NULL,
    ADD COLUMN `medical_care` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `wants_contact` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `contact_email_encrypted` TEXT NULL;

-- CreateTable
CREATE TABLE `report_positive_effects` (
    `report_id` VARCHAR(191) NOT NULL,
    `effect_id` VARCHAR(191) NOT NULL,

    INDEX `report_positive_effects_effect_id_idx`(`effect_id`),
    PRIMARY KEY (`report_id`, `effect_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `report_positive_effects` ADD CONSTRAINT `report_positive_effects_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_positive_effects` ADD CONSTRAINT `report_positive_effects_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `positive_effects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
