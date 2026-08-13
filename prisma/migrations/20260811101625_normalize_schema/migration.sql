/*
  Warnings:

  - You are about to drop the column `model_score` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `model_version_id` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `predicted_label` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `symptom_map_version_id` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `symptoms` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `synthetic_record_id` on the `assessments` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `model_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `symptom_map_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `synthetic_records` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `visit_id` to the `assessments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assessments` DROP FOREIGN KEY `assessments_created_by_fkey`;

-- DropForeignKey
ALTER TABLE `assessments` DROP FOREIGN KEY `assessments_model_version_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessments` DROP FOREIGN KEY `assessments_symptom_map_version_id_fkey`;

-- DropForeignKey
ALTER TABLE `assessments` DROP FOREIGN KEY `assessments_synthetic_record_id_fkey`;

-- DropForeignKey
ALTER TABLE `audit_logs` DROP FOREIGN KEY `audit_logs_userId_fkey`;

-- DropForeignKey
ALTER TABLE `synthetic_records` DROP FOREIGN KEY `synthetic_records_created_by_fkey`;

-- DropIndex
DROP INDEX `assessments_model_version_id_idx` ON `assessments`;

-- DropIndex
DROP INDEX `assessments_symptom_map_version_id_idx` ON `assessments`;

-- DropIndex
DROP INDEX `assessments_synthetic_record_id_idx` ON `assessments`;

-- DropIndex
DROP INDEX `audit_logs_userId_idx` ON `audit_logs`;

-- AlterTable
ALTER TABLE `assessments` DROP COLUMN `model_score`,
    DROP COLUMN `model_version_id`,
    DROP COLUMN `predicted_label`,
    DROP COLUMN `status`,
    DROP COLUMN `symptom_map_version_id`,
    DROP COLUMN `symptoms`,
    DROP COLUMN `synthetic_record_id`,
    ADD COLUMN `heart_rate` INTEGER NULL,
    ADD COLUMN `respiratory_rate` INTEGER NULL,
    ADD COLUMN `temperature_c` DOUBLE NULL,
    ADD COLUMN `visit_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `audit_logs` DROP COLUMN `userId`,
    ADD COLUMN `user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `role`,
    ADD COLUMN `role_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `model_versions`;

-- DropTable
DROP TABLE `symptom_map_versions`;

-- DropTable
DROP TABLE `synthetic_records`;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    UNIQUE INDEX `permissions_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `role_id` INTEGER NOT NULL,
    `permission_id` INTEGER NOT NULL,

    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patients` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `created_by` INTEGER NOT NULL,
    `age` INTEGER NOT NULL,
    `sex` ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
    `is_synthetic` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `patients_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `patient_visits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `patient_id` INTEGER NOT NULL,
    `visit_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `patient_visits_patient_id_idx`(`patient_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `symptoms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `is_enabled` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `symptoms_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessment_symptoms` (
    `assessment_id` INTEGER NOT NULL,
    `symptom_id` INTEGER NOT NULL,

    PRIMARY KEY (`assessment_id`, `symptom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `diseases` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `diseases_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `disease_symptoms` (
    `disease_id` INTEGER NOT NULL,
    `symptom_id` INTEGER NOT NULL,

    PRIMARY KEY (`disease_id`, `symptom_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_models` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(50) NOT NULL,
    `hash` VARCHAR(128) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ai_models_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `symptom_maps` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `version` VARCHAR(50) NOT NULL,
    `hash` VARCHAR(128) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `symptom_maps_version_key`(`version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prediction_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `assessment_id` INTEGER NOT NULL,
    `model_id` INTEGER NOT NULL,
    `map_id` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'INSUFFICIENT_INFORMATION', 'OUT_OF_SCOPE', 'UNKNOWN') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `prediction_sessions_assessment_id_idx`(`assessment_id`),
    INDEX `prediction_sessions_model_id_idx`(`model_id`),
    INDEX `prediction_sessions_map_id_idx`(`map_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prediction_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `session_id` INTEGER NOT NULL,
    `disease_id` INTEGER NOT NULL,
    `score` DOUBLE NOT NULL,
    `rank` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `prediction_results_session_id_idx`(`session_id`),
    INDEX `prediction_results_disease_id_idx`(`disease_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `assessments_visit_id_idx` ON `assessments`(`visit_id`);

-- CreateIndex
CREATE INDEX `audit_logs_user_id_idx` ON `audit_logs`(`user_id`);

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patients` ADD CONSTRAINT `patients_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `patient_visits` ADD CONSTRAINT `patient_visits_patient_id_fkey` FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessments` ADD CONSTRAINT `assessments_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `patient_visits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_symptoms` ADD CONSTRAINT `assessment_symptoms_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assessment_symptoms` ADD CONSTRAINT `assessment_symptoms_symptom_id_fkey` FOREIGN KEY (`symptom_id`) REFERENCES `symptoms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disease_symptoms` ADD CONSTRAINT `disease_symptoms_disease_id_fkey` FOREIGN KEY (`disease_id`) REFERENCES `diseases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `disease_symptoms` ADD CONSTRAINT `disease_symptoms_symptom_id_fkey` FOREIGN KEY (`symptom_id`) REFERENCES `symptoms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prediction_sessions` ADD CONSTRAINT `prediction_sessions_assessment_id_fkey` FOREIGN KEY (`assessment_id`) REFERENCES `assessments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prediction_sessions` ADD CONSTRAINT `prediction_sessions_model_id_fkey` FOREIGN KEY (`model_id`) REFERENCES `ai_models`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prediction_sessions` ADD CONSTRAINT `prediction_sessions_map_id_fkey` FOREIGN KEY (`map_id`) REFERENCES `symptom_maps`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prediction_results` ADD CONSTRAINT `prediction_results_session_id_fkey` FOREIGN KEY (`session_id`) REFERENCES `prediction_sessions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prediction_results` ADD CONSTRAINT `prediction_results_disease_id_fkey` FOREIGN KEY (`disease_id`) REFERENCES `diseases`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
