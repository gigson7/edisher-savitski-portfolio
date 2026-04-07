/*
  Warnings:

  - You are about to alter the column `country` on the `performances` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE `performances` MODIFY `title` VARCHAR(500) NOT NULL,
    MODIFY `venue` VARCHAR(500) NOT NULL,
    MODIFY `location` VARCHAR(300) NOT NULL,
    MODIFY `country` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `videos` MODIFY `title` VARCHAR(500) NOT NULL;
