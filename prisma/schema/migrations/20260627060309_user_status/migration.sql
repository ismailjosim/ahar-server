/*
  Warnings:

  - You are about to drop the column `allergens` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercent` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `discountPrice` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isGlutenFree` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isHalal` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isVegan` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `isVegetarian` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `nutrition` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `stockStatus` on the `MenuItem` table. All the data in the column will be lost.
  - The `isActive` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `MenuItemAddOn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuItemVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "MenuItemAddOn" DROP CONSTRAINT "MenuItemAddOn_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItemVariant" DROP CONSTRAINT "MenuItemVariant_menuItemId_fkey";

-- DropIndex
DROP INDEX "MenuItem_isFeatured_idx";

-- DropIndex
DROP INDEX "MenuItem_slug_key";

-- DropIndex
DROP INDEX "MenuItem_sortOrder_idx";

-- DropIndex
DROP INDEX "MenuItem_stockStatus_idx";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "allergens",
DROP COLUMN "discountPercent",
DROP COLUMN "discountPrice",
DROP COLUMN "isGlutenFree",
DROP COLUMN "isHalal",
DROP COLUMN "isVegan",
DROP COLUMN "isVegetarian",
DROP COLUMN "nutrition",
DROP COLUMN "slug",
DROP COLUMN "sortOrder",
DROP COLUMN "stockStatus",
ADD COLUMN     "addOns" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
ADD COLUMN     "variants" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "user" DROP COLUMN "isActive",
ADD COLUMN     "isActive" "UserStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropTable
DROP TABLE "MenuItemAddOn";

-- DropTable
DROP TABLE "MenuItemVariant";
