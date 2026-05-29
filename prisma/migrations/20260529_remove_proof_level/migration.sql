-- DropIndex
DROP INDEX `reports_moderation_status_proof_level_idx` ON `reports`;

-- DropIndex
DROP INDEX `adverse_effect_declarations_moderation_status_proof_level_idx` ON `adverse_effect_declarations`;

-- AlterTable: drop proof_level column from reports
ALTER TABLE `reports` DROP COLUMN `proof_level`;

-- AlterTable: drop proof_level column from adverse_effect_declarations
ALTER TABLE `adverse_effect_declarations` DROP COLUMN `proof_level`;

-- CreateIndex (replacement without proof_level)
CREATE INDEX `reports_moderation_status_idx` ON `reports`(`moderation_status`);

-- CreateIndex (replacement without proof_level)
CREATE INDEX `adverse_effect_declarations_moderation_status_idx` ON `adverse_effect_declarations`(`moderation_status`);
