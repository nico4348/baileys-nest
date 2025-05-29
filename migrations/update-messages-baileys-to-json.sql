-- Migration: Update messages table to change baileys_id to baileys_json
-- This migration changes the baileys_id varchar field to baileys_json json field

-- First, add the new json column
ALTER TABLE messages ADD COLUMN baileys_json JSON NULL;

-- Copy existing data from baileys_id to baileys_json (if needed)
-- Note: Since we're changing from storing ID to storing full JSON, 
-- existing data will be lost in this transformation
-- UPDATE messages SET baileys_json = JSON_OBJECT('id', baileys_id) WHERE baileys_id IS NOT NULL;

-- Drop the old column
ALTER TABLE messages DROP COLUMN baileys_id;