
-- 1. Add baileys_id column to messages table
ALTER TABLE messages ADD COLUMN baileys_id VARCHAR(25);

-- 2. Copy existing IDs to the new baileys_id column
UPDATE messages SET baileys_id = id;

-- 3. Create temporary UUIDs for all existing messages
-- Using a temporary column to hold UUIDs while we restructure the table
ALTER TABLE messages ADD COLUMN temp_uuid UUID DEFAULT uuid_generate_v4();

-- 4. Backup text_messages, media_messages, and reaction_messages
CREATE TABLE text_messages_backup AS SELECT * FROM text_messages;
CREATE TABLE media_messages_backup AS SELECT * FROM media_messages;
CREATE TABLE reaction_messages_backup AS SELECT * FROM reaction_messages;

-- 5. Update the relationship tables to reference the new UUIDs
-- We'll use the message_id to join back to the messages table and get the new UUID
UPDATE text_messages tm
SET message_id = m.temp_uuid
FROM messages m
WHERE tm.message_id = m.id;

UPDATE media_messages mm
SET message_id = m.temp_uuid
FROM messages m
WHERE mm.message_id = m.id;

UPDATE reaction_messages rm
SET message_id = m.temp_uuid,
    target_msg_id = m_target.temp_uuid
FROM messages m, messages m_target
WHERE rm.message_id = m.id AND rm.target_msg_id = m_target.id;

-- 6. Update message status relationships
ALTER TABLE message_status ADD COLUMN temp_message_id UUID;

UPDATE message_status ms
SET temp_message_id = m.temp_uuid
FROM messages m
WHERE ms.message_id = m.id;

-- 7. Update quoted_message_id references to use UUIDs
ALTER TABLE messages ADD COLUMN temp_quoted_uuid UUID;

UPDATE messages m
SET temp_quoted_uuid = mq.temp_uuid
FROM messages mq
WHERE m.quoted_message_id = mq.id AND m.quoted_message_id IS NOT NULL;

-- 8. Now alter the table structures to use UUIDs

-- First, drop constraints that reference messages
ALTER TABLE text_messages DROP CONSTRAINT IF EXISTS text_messages_message_id_fkey;
ALTER TABLE media_messages DROP CONSTRAINT IF EXISTS media_messages_message_id_fkey;
ALTER TABLE reaction_messages DROP CONSTRAINT IF EXISTS reaction_messages_message_id_fkey;
ALTER TABLE reaction_messages DROP CONSTRAINT IF EXISTS reaction_messages_target_msg_id_fkey;
ALTER TABLE message_status DROP CONSTRAINT IF EXISTS message_status_message_id_fkey;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_quoted_message_id_fkey;

-- 9. Alter message_id columns in related tables to UUID type
ALTER TABLE text_messages ALTER COLUMN message_id TYPE UUID USING message_id::uuid;
ALTER TABLE media_messages ALTER COLUMN message_id TYPE UUID USING message_id::uuid;
ALTER TABLE reaction_messages ALTER COLUMN message_id TYPE UUID USING message_id::uuid;
ALTER TABLE reaction_messages ALTER COLUMN target_msg_id TYPE UUID USING target_msg_id::uuid;
ALTER TABLE message_status DROP COLUMN message_id;
ALTER TABLE message_status RENAME COLUMN temp_message_id TO message_id;

-- 10. Now, we can modify the messages table
-- First create a new table with the desired structure
CREATE TABLE messages_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    baileys_id VARCHAR(25),
    session_id UUID,
    quoted_message_id UUID,
    to VARCHAR(50),
    message_type VARCHAR(50),
    created_at TIMESTAMP
);

-- 11. Insert data from old table to new table
INSERT INTO messages_new (id, baileys_id, session_id, quoted_message_id, to, message_type, created_at)
SELECT temp_uuid, baileys_id, session_id, temp_quoted_uuid, to, message_type, created_at
FROM messages;

-- 12. Drop old table and rename new table
DROP TABLE messages;
ALTER TABLE messages_new RENAME TO messages;

-- 13. Recreate foreign key constraints
ALTER TABLE messages ADD CONSTRAINT messages_session_id_fkey 
    FOREIGN KEY (session_id) REFERENCES sessions(id);
    
ALTER TABLE messages ADD CONSTRAINT messages_quoted_message_id_fkey 
    FOREIGN KEY (quoted_message_id) REFERENCES messages(id);

ALTER TABLE text_messages ADD CONSTRAINT text_messages_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES messages(id);
    
ALTER TABLE media_messages ADD CONSTRAINT media_messages_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES messages(id);
    
ALTER TABLE reaction_messages ADD CONSTRAINT reaction_messages_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES messages(id);
    
ALTER TABLE reaction_messages ADD CONSTRAINT reaction_messages_target_msg_id_fkey 
    FOREIGN KEY (target_msg_id) REFERENCES messages(id);
    
ALTER TABLE message_status ADD CONSTRAINT message_status_message_id_fkey 
    FOREIGN KEY (message_id) REFERENCES messages(id);

-- 14. Drop backup tables if everything is working correctly
-- DROP TABLE text_messages_backup;
-- DROP TABLE media_messages_backup;
-- DROP TABLE reaction_messages_backup;
