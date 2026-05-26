-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'VERIFIED_CONTRIBUTOR', 'MODERATOR', 'ADMIN', 'VERIFIED_INSTITUTION') NOT NULL DEFAULT 'USER',
    `email_verified_at` DATETIME(3) NULL,
    `terms_accepted_at` DATETIME(3) NULL,
    `charter_accepted_at` DATETIME(3) NULL,
    `charter_version` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `last_login_ip_hash` VARCHAR(191) NULL,
    `banned_at` DATETIME(3) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verification_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `email_verification_tokens_token_hash_key`(`token_hash`),
    INDEX `email_verification_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_reset_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `token_hash` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `used_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_reset_tokens_token_hash_key`(`token_hash`),
    INDEX `password_reset_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` VARCHAR(191) NOT NULL,
    `country_code` VARCHAR(191) NOT NULL,
    `country_name` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NULL,
    `city` VARCHAR(191) NOT NULL,
    `district` VARCHAR(191) NULL,
    `postcode` VARCHAR(191) NULL,
    `display_zone` VARCHAR(191) NOT NULL,
    `centroid_lat` DOUBLE NOT NULL,
    `centroid_lng` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `locations_country_code_city_idx`(`country_code`, `city`),
    UNIQUE INDEX `locations_country_code_city_district_key`(`country_code`, `city`, `district`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brands` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `brands_name_key`(`name`),
    UNIQUE INDEX `brands_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `brand_id` VARCHAR(191) NULL,
    `commercial_name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `default_product_type` ENUM('FLOWER', 'RESIN', 'VAPE', 'CARTRIDGE', 'LIQUID', 'CANDY', 'OIL', 'CAPSULE', 'POWDER', 'SPRAY', 'OTHER') NULL,
    `status` ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `first_seen_at` DATETIME(3) NULL,
    `last_seen_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `products_commercial_name_idx`(`commercial_name`),
    UNIQUE INDEX `products_brand_id_slug_key`(`brand_id`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `molecules` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `molecules_name_key`(`name`),
    UNIQUE INDEX `molecules_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marketing_claims` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `marketing_claims_label_key`(`label`),
    UNIQUE INDEX `marketing_claims_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adverse_effects` (
    `id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `adverse_effects_label_key`(`label`),
    UNIQUE INDEX `adverse_effects_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(191) NOT NULL,
    `created_by_id` VARCHAR(191) NULL,
    `location_id` VARCHAR(191) NOT NULL,
    `place_type` ENUM('CBD_SHOP', 'TOBACCO', 'ESHOP', 'VENDING_MACHINE', 'SOCIAL_NETWORK', 'INFORMAL_MARKET', 'EVENT', 'OTHER') NOT NULL,
    `place_other_label` VARCHAR(191) NULL,
    `brand_id` VARCHAR(191) NULL,
    `brand_raw_name` VARCHAR(191) NULL,
    `product_id` VARCHAR(191) NULL,
    `product_commercial_name` VARCHAR(191) NULL,
    `product_type` ENUM('FLOWER', 'RESIN', 'VAPE', 'CARTRIDGE', 'LIQUID', 'CANDY', 'OIL', 'CAPSULE', 'POWDER', 'SPRAY', 'OTHER') NULL,
    `product_other_label` VARCHAR(191) NULL,
    `form_of_use` ENUM('INHALATION', 'DABBING', 'PIPE', 'WATER_PIPE', 'INFUSION', 'INGESTION', 'OTHER') NULL,
    `quantity_observed` DECIMAL(10, 2) NULL,
    `price_observed` DECIMAL(10, 2) NULL,
    `price_mode` ENUM('PER_GRAM', 'TOTAL', 'UNKNOWN') NULL,
    `observation_date` DATETIME(3) NOT NULL,
    `narrative` TEXT NULL,
    `moderation_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'CONTESTED') NOT NULL DEFAULT 'PENDING_REVIEW',
    `proof_level` ENUM('L1_TESTIMONY', 'L2_VISUAL', 'L3_COMMERCIAL_DOC', 'L4_LAB_ANALYSIS', 'L5_SANITARY_SIGNAL') NOT NULL DEFAULT 'L1_TESTIMONY',
    `exact_address_encrypted` TEXT NULL,
    `exact_lat` DOUBLE NULL,
    `exact_lng` DOUBLE NULL,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `reports_moderation_status_proof_level_idx`(`moderation_status`, `proof_level`),
    INDEX `reports_location_id_moderation_status_idx`(`location_id`, `moderation_status`),
    INDEX `reports_created_by_id_idx`(`created_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_molecules` (
    `report_id` VARCHAR(191) NOT NULL,
    `molecule_id` VARCHAR(191) NOT NULL,
    `kind` ENUM('ANNOUNCED', 'SUSPECTED', 'COMPOSITION') NOT NULL,

    INDEX `report_molecules_molecule_id_idx`(`molecule_id`),
    PRIMARY KEY (`report_id`, `molecule_id`, `kind`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_marketing_claims` (
    `report_id` VARCHAR(191) NOT NULL,
    `claim_id` VARCHAR(191) NOT NULL,

    INDEX `report_marketing_claims_claim_id_idx`(`claim_id`),
    PRIMARY KEY (`report_id`, `claim_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_adverse_effects` (
    `report_id` VARCHAR(191) NOT NULL,
    `effect_id` VARCHAR(191) NOT NULL,

    INDEX `report_adverse_effects_effect_id_idx`(`effect_id`),
    PRIMARY KEY (`report_id`, `effect_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `evidence` (
    `id` VARCHAR(191) NOT NULL,
    `report_id` VARCHAR(191) NULL,
    `declaration_id` VARCHAR(191) NULL,
    `type` ENUM('PHOTO_PACKAGING', 'SCREENSHOT', 'RECEIPT_LABEL', 'COMMERCIAL_LISTING', 'LAB_RESULT', 'OTHER') NOT NULL,
    `file_path` VARCHAR(191) NOT NULL,
    `mime_type` VARCHAR(191) NOT NULL,
    `original_name` VARCHAR(191) NULL,
    `exif_stripped_at` DATETIME(3) NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `evidence_report_id_idx`(`report_id`),
    INDEX `evidence_declaration_id_idx`(`declaration_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adverse_effect_declarations` (
    `id` VARCHAR(191) NOT NULL,
    `created_by_id` VARCHAR(191) NULL,
    `location_id` VARCHAR(191) NULL,
    `product_id` VARCHAR(191) NULL,
    `brand_id` VARCHAR(191) NULL,
    `product_name_raw` VARCHAR(191) NULL,
    `brand_name_raw` VARCHAR(191) NULL,
    `country_code` VARCHAR(191) NULL,
    `approximate_period` VARCHAR(191) NULL,
    `effect_duration` VARCHAR(191) NULL,
    `withdrawal_symptoms` TEXT NULL,
    `medical_care` BOOLEAN NOT NULL DEFAULT false,
    `wants_contact` BOOLEAN NOT NULL DEFAULT false,
    `contact_email_encrypted` TEXT NULL,
    `narrative` TEXT NULL,
    `moderation_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'CONTESTED') NOT NULL DEFAULT 'PENDING_REVIEW',
    `proof_level` ENUM('L1_TESTIMONY', 'L2_VISUAL', 'L3_COMMERCIAL_DOC', 'L4_LAB_ANALYSIS', 'L5_SANITARY_SIGNAL') NOT NULL DEFAULT 'L1_TESTIMONY',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `adverse_effect_declarations_moderation_status_proof_level_idx`(`moderation_status`, `proof_level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adverse_effect_declaration_molecules` (
    `declaration_id` VARCHAR(191) NOT NULL,
    `molecule_id` VARCHAR(191) NOT NULL,
    `kind` ENUM('ANNOUNCED', 'SUSPECTED', 'COMPOSITION') NOT NULL,

    INDEX `adverse_effect_declaration_molecules_molecule_id_idx`(`molecule_id`),
    PRIMARY KEY (`declaration_id`, `molecule_id`, `kind`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `adverse_effect_declaration_effects` (
    `declaration_id` VARCHAR(191) NOT NULL,
    `effect_id` VARCHAR(191) NOT NULL,

    INDEX `adverse_effect_declaration_effects_effect_id_idx`(`effect_id`),
    PRIMARY KEY (`declaration_id`, `effect_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `moderation_actions` (
    `id` VARCHAR(191) NOT NULL,
    `report_id` VARCHAR(191) NULL,
    `declaration_id` VARCHAR(191) NULL,
    `moderator_id` VARCHAR(191) NULL,
    `action` ENUM('SUBMIT', 'REQUEST_PROOF', 'MASK_ADDRESS', 'CHANGE_PROOF_LEVEL', 'PUBLISH_LIMITED', 'PUBLISH', 'REJECT', 'ARCHIVE', 'CONTEST', 'MERGE', 'NOTE', 'ROLE_CHANGE', 'VALIDATE_EVIDENCE', 'DELETE_ACCOUNT') NOT NULL,
    `before_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'CONTESTED') NULL,
    `after_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'ARCHIVED', 'CONTESTED') NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `moderation_actions_report_id_created_at_idx`(`report_id`, `created_at`),
    INDEX `moderation_actions_declaration_id_created_at_idx`(`declaration_id`, `created_at`),
    INDEX `moderation_actions_moderator_id_created_at_idx`(`moderator_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_log` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `ip_hash` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `target_type` VARCHAR(191) NOT NULL,
    `target_id` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_log_user_id_created_at_idx`(`user_id`, `created_at`),
    INDEX `audit_log_target_type_target_id_idx`(`target_type`, `target_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_molecules` ADD CONSTRAINT `report_molecules_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_molecules` ADD CONSTRAINT `report_molecules_molecule_id_fkey` FOREIGN KEY (`molecule_id`) REFERENCES `molecules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_marketing_claims` ADD CONSTRAINT `report_marketing_claims_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_marketing_claims` ADD CONSTRAINT `report_marketing_claims_claim_id_fkey` FOREIGN KEY (`claim_id`) REFERENCES `marketing_claims`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_adverse_effects` ADD CONSTRAINT `report_adverse_effects_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_adverse_effects` ADD CONSTRAINT `report_adverse_effects_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `adverse_effects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `evidence` ADD CONSTRAINT `evidence_declaration_id_fkey` FOREIGN KEY (`declaration_id`) REFERENCES `adverse_effect_declarations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declarations` ADD CONSTRAINT `adverse_effect_declarations_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declarations` ADD CONSTRAINT `adverse_effect_declarations_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declarations` ADD CONSTRAINT `adverse_effect_declarations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declarations` ADD CONSTRAINT `adverse_effect_declarations_brand_id_fkey` FOREIGN KEY (`brand_id`) REFERENCES `brands`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declaration_molecules` ADD CONSTRAINT `adverse_effect_declaration_molecules_declaration_id_fkey` FOREIGN KEY (`declaration_id`) REFERENCES `adverse_effect_declarations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declaration_molecules` ADD CONSTRAINT `adverse_effect_declaration_molecules_molecule_id_fkey` FOREIGN KEY (`molecule_id`) REFERENCES `molecules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declaration_effects` ADD CONSTRAINT `adverse_effect_declaration_effects_declaration_id_fkey` FOREIGN KEY (`declaration_id`) REFERENCES `adverse_effect_declarations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `adverse_effect_declaration_effects` ADD CONSTRAINT `adverse_effect_declaration_effects_effect_id_fkey` FOREIGN KEY (`effect_id`) REFERENCES `adverse_effects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_report_id_fkey` FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_declaration_id_fkey` FOREIGN KEY (`declaration_id`) REFERENCES `adverse_effect_declarations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `moderation_actions` ADD CONSTRAINT `moderation_actions_moderator_id_fkey` FOREIGN KEY (`moderator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_log` ADD CONSTRAINT `audit_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

