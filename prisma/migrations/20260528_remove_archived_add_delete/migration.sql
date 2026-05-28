-- Remove ARCHIVED from ReportStatus enum and replace ARCHIVE with DELETE in ModerationActionType

-- 1. Update any existing ARCHIVED reports to REJECTED before altering the enum
UPDATE `reports` SET `moderation_status` = 'REJECTED' WHERE `moderation_status` = 'ARCHIVED';

-- 2. Alter ReportStatus enum on reports table (remove ARCHIVED)
ALTER TABLE `reports` MODIFY COLUMN `moderation_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'CONTESTED') NOT NULL DEFAULT 'SUBMITTED';

-- 3. Update before_status/after_status in moderation_actions that might reference ARCHIVED
UPDATE `moderation_actions` SET `before_status` = 'REJECTED' WHERE `before_status` = 'ARCHIVED';

-- 4.
UPDATE `moderation_actions` SET `after_status` = 'REJECTED' WHERE `after_status` = 'ARCHIVED';

-- 5. Alter before_status and after_status columns to match new ReportStatus enum
ALTER TABLE `moderation_actions` MODIFY COLUMN `before_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'CONTESTED') NULL;

-- 6.
ALTER TABLE `moderation_actions` MODIFY COLUMN `after_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'CONTESTED') NULL;

-- 7. Add DELETE to ModerationActionType enum first (keeping ARCHIVE temporarily)
ALTER TABLE `moderation_actions` MODIFY COLUMN `action` ENUM('SUBMIT', 'REQUEST_PROOF', 'MASK_ADDRESS', 'CHANGE_PROOF_LEVEL', 'PUBLISH_LIMITED', 'PUBLISH', 'REJECT', 'ARCHIVE', 'DELETE', 'CONTEST', 'MERGE', 'NOTE', 'ROLE_CHANGE', 'VALIDATE_EVIDENCE', 'DELETE_ACCOUNT') NOT NULL;

-- 8. Update any existing ARCHIVE actions to DELETE
UPDATE `moderation_actions` SET `action` = 'DELETE' WHERE `action` = 'ARCHIVE';

-- 9. Remove ARCHIVE from the enum now that no rows use it
ALTER TABLE `moderation_actions` MODIFY COLUMN `action` ENUM('SUBMIT', 'REQUEST_PROOF', 'MASK_ADDRESS', 'CHANGE_PROOF_LEVEL', 'PUBLISH_LIMITED', 'PUBLISH', 'REJECT', 'DELETE', 'CONTEST', 'MERGE', 'NOTE', 'ROLE_CHANGE', 'VALIDATE_EVIDENCE', 'DELETE_ACCOUNT') NOT NULL;
