-- Migration to fix entity relationship column types
-- Run this migration to align foreign key column types with primary keys

-- Fix message_status.message_id column type to match messages.id
ALTER TABLE message_status 
ALTER COLUMN message_id TYPE varchar(25);

-- Fix reaction_messages.target_msg_id column type to match messages.id  
ALTER TABLE reaction_messages
ALTER COLUMN target_msg_id TYPE varchar(25);

-- Optional: Add foreign key constraints if they don't exist
-- (Only run if constraints are not already defined)

-- Foreign key for message_status.message_id -> messages.id
-- ALTER TABLE message_status 
-- ADD CONSTRAINT fk_message_status_message_id 
-- FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE;

-- Foreign key for reaction_messages.target_msg_id -> messages.id
-- ALTER TABLE reaction_messages 
-- ADD CONSTRAINT fk_reaction_messages_target_msg_id 
-- FOREIGN KEY (target_msg_id) REFERENCES messages(id) ON DELETE CASCADE;