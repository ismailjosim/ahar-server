-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "itemSummary" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "displayTime" TEXT NOT NULL DEFAULT '';
