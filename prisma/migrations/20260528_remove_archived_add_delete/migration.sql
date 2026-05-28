-- Remove ARCHIVED from ReportStatus enum and add DELETE to ModerationActionType
-- MySQL requires recreating the column to change enum values

-- Update any existing ARCHIVED reports to REJECTED before altering the enum
UPDATE `reports` SET `moderation_status` = 'REJECTED' WHERE `moderation_status` = 'ARCHIVED';

-- Alter ReportStatus enum (remove ARCHIVED)
ALTER TABLE `reports` MODIFY COLUMN `moderation_status` ENUM('DRAFT', 'SUBMITTED', 'PENDING_REVIEW', 'PUBLISHED_LIMITED', 'PUBLISHED', 'REJECTED', 'CONTESTED') NOT NULL DEFAULT 'SUBMITTED';

-- Update any existing ARCHIVE moderation actions to DELETE
UPDATE `moderation_actions` SET `action` = 'DELETE' WHERE `action` = 'ARCHIVE';

-- Alter ModerationActionType enum (replace ARCHIVE with DELETE)
ALTER TABLE `moderation_actions` MODIFY COLUMN `action` ENUM('SUBMIT', 'REQUEST_PROOF', 'MASK_ADDRESS', 'CHANGE_PROOF_LEVEL', 'PUBLISH_LIMITED', 'PUBLISH', 'REJECT', 'DELETE', 'CONTEST', 'MERGE', 'NOTE', 'ROLE_CHANGE', 'VALIDATE_EVIDENCE', 'DELETE_ACCOUNT') NOT NULL;
