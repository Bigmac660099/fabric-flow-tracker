/*
  # Add Author Name to Chat Messages (Denormalization for Security)
  
  ## Purpose
  
  With strict RLS policies, employees can only view their own profile.
  This breaks team chat functionality where users need to see who wrote each message.
  
  ## Solution
  
  Denormalize the author's name directly into the chat_messages table.
  This is a common pattern in chat systems and provides:
  - Better security (no need to expose profile table)  
  - Better performance (no joins needed)
  - Consistency (name is captured at message creation time)
  
  ## Changes
  
  1. Add `author_name` column to chat_messages table
  2. Create a trigger to automatically populate author_name from profiles
  3. Backfill existing messages with author names
  
  ## Security Note
  
  This approach prevents email exposure while allowing chat functionality.
  Users can see names of message authors without accessing the profiles table.
*/

-- Add author_name column to store the sender's name
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS author_name TEXT;

-- Create function to automatically set author_name from profile
CREATE OR REPLACE FUNCTION set_chat_message_author_name()
RETURNS TRIGGER AS $$
BEGIN
  SELECT full_name INTO NEW.author_name
  FROM profiles
  WHERE user_id = NEW.user_id;
  
  -- Fallback if profile not found
  IF NEW.author_name IS NULL THEN
    NEW.author_name := 'Unknown User';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run before insert
DROP TRIGGER IF EXISTS set_author_name_trigger ON chat_messages;
CREATE TRIGGER set_author_name_trigger
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_chat_message_author_name();

-- Backfill existing messages with author names
UPDATE chat_messages cm
SET author_name = COALESCE(p.full_name, 'Unknown User')
FROM profiles p
WHERE cm.user_id = p.user_id
  AND cm.author_name IS NULL;

-- Set any remaining null values to Unknown User
UPDATE chat_messages
SET author_name = 'Unknown User'
WHERE author_name IS NULL;

-- Make author_name NOT NULL after backfill
ALTER TABLE chat_messages 
ALTER COLUMN author_name SET NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at 
  ON chat_messages(created_at DESC);
