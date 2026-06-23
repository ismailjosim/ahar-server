-- Feature 08: Add capacity configuration fields to RestaurantSettings
-- maxTablesPerSlot: maximum concurrent reservations within a time slot
-- reservationSlotGap: width of the booking window in minutes (default 30)

ALTER TABLE "RestaurantSettings"
  ADD COLUMN IF NOT EXISTS "maxTablesPerSlot" INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS "reservationSlotGap" INTEGER NOT NULL DEFAULT 30;
