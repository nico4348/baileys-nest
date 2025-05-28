-- Migration to handle event_id column in event_logs table
-- This script addresses the issue where existing records have NULL event_id values

-- First, let's check if there are any NULL values and provide a default event_id
-- We'll create a default event if it doesn't exist
DO $$
DECLARE
    default_event_id UUID;
BEGIN
    -- Check if there's already a default event, if not create one
    SELECT id INTO default_event_id FROM events WHERE event_name = 'default_event' LIMIT 1;
    
    IF default_event_id IS NULL THEN
        -- Create a default event
        default_event_id := gen_random_uuid();
        INSERT INTO events (id, event_name, description, created_at)
        VALUES (default_event_id, 'default_event', 'Default event for migration purposes', NOW());
    END IF;
    
    -- Update all NULL event_id values with the default event_id
    UPDATE event_logs 
    SET event_id = default_event_id 
    WHERE event_id IS NULL;
    
    -- Now make the column NOT NULL if it isn't already
    ALTER TABLE event_logs ALTER COLUMN event_id SET NOT NULL;
    
    RAISE NOTICE 'Migration completed. Updated NULL event_id values with default event: %', default_event_id;
END $$;