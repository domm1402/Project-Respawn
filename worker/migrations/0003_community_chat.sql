ALTER TABLE messages ADD COLUMN author_name TEXT NOT NULL DEFAULT 'Player';
CREATE INDEX idx_messages_channel_created ON messages(channel_id,created_at);
