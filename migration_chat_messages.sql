CREATE TABLE chat_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id    UUID NOT NULL REFERENCES chat(id) ON DELETE CASCADE,
    sender_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW())::BIGINT,
    is_read    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_chat_messages_chat_id    ON chat_messages(chat_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(chat_id, created_at DESC);

CREATE UNIQUE INDEX idx_chat_users 
    ON chat(LEAST(user_1::text, user_2::text), GREATEST(user_1::text, user_2::text));
