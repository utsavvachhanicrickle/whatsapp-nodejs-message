CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "whatsappId" VARCHAR(100),
    lid VARCHAR(255),
    name VARCHAR(255),
    "pushName" VARCHAR(255),
    "phoneNumber" VARCHAR(20) NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
    "sessionId" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("phoneNumber", "userId", "sessionId")
);

-- Default Messages Table
CREATE TABLE IF NOT EXISTS default_messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Whatsapp Sections Table
CREATE TABLE IF NOT EXISTS whatsapp_sections (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number VARCHAR(255) NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Personal Messages Table (private chats only)
CREATE TABLE IF NOT EXISTS personal_messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "chatId" VARCHAR(255) NOT NULL,
    "isGroup" BOOLEAN DEFAULT false,
    body TEXT,
    "type" VARCHAR(50) DEFAULT 'chat',
    "fromMe" BOOLEAN DEFAULT false,
    timestamp BIGINT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Group Messages Table (group chats only)
CREATE TABLE IF NOT EXISTS group_messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    "chatId" VARCHAR(255) NOT NULL,
    "author" VARCHAR(255),
    "isGroup" BOOLEAN DEFAULT true,
    body TEXT,
    "type" VARCHAR(50) DEFAULT 'chat',
    "fromMe" BOOLEAN DEFAULT false,
    timestamp BIGINT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Master / Linking Table)
CREATE TABLE IF NOT EXISTS messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" VARCHAR(255) NOT NULL,
    "userId" UUID REFERENCES users(_id) ON DELETE CASCADE,
    "personalMessageId" UUID REFERENCES personal_messages(_id) ON DELETE CASCADE,
    "groupMessageId" UUID REFERENCES group_messages(_id) ON DELETE CASCADE,
    "whatsappId" VARCHAR(255) UNIQUE NOT NULL,
    "rawData" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "messageId" UUID REFERENCES messages(_id) ON DELETE CASCADE,
    "mediaType" VARCHAR(50),
    "mimeType" VARCHAR(255),
    "publicUrl" TEXT,
    "localPath" TEXT,
    "fileName" TEXT,
    "fileSize" BIGINT,
    "caption" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- default keyword
CREATE TABLE IF NOT EXISTS default_keywords (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
    "sessionId" VARCHAR(255) NOT NULL,
    defaultKeyword VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Default Keywords Messages
CREATE TABLE IF NOT EXISTS default_keywords_messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
    "sessionId" VARCHAR(255) NOT NULL,
    defaulWordsMessages TEXT DEFAULT '',
    "is_starred" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- MIGRATIONS (safe, idempotent)
-- ============================================================
-- Migration: Add lid column to contacts if not exists
DO $$ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'contacts'
        AND column_name = 'lid'
) THEN
ALTER TABLE
    contacts
ADD
    COLUMN lid VARCHAR(255);

END IF;

END $$;

-- Migration: Rename chat_messages → personal_messages if old table still exists
DO $$ BEGIN IF EXISTS (
    SELECT
        1
    FROM
        information_schema.tables
    WHERE
        table_name = 'chat_messages'
)
AND NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.tables
    WHERE
        table_name = 'personal_messages'
) THEN
ALTER TABLE
    chat_messages RENAME TO personal_messages;

END IF;

END $$;

-- Migration: Add author column to group_messages if missing
DO $$ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'group_messages'
        AND column_name = 'author'
) THEN
ALTER TABLE
    group_messages
ADD
    COLUMN "author" VARCHAR(255);

END IF;

END $$;

-- Migration: Add personalMessageId to messages (replacing chatMessageId)
DO $$ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'messages'
        AND column_name = 'personalMessageId'
) THEN
ALTER TABLE
    messages
ADD
    COLUMN "personalMessageId" UUID REFERENCES personal_messages(_id) ON DELETE CASCADE;

-- Only copy values that have a matching row in personal_messages (avoid FK violations)
IF EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'messages'
        AND column_name = 'chatMessageId'
) THEN
UPDATE
    messages m
SET
    "personalMessageId" = m."chatMessageId"
WHERE
    m."chatMessageId" IS NOT NULL
    AND EXISTS (
        SELECT
            1
        FROM
            personal_messages pm
        WHERE
            pm._id = m."chatMessageId"
    );

END IF;

END IF;

END $$;

-- Migration: Add groupMessageId to messages if missing
DO $$ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'messages'
        AND column_name = 'groupMessageId'
) THEN
ALTER TABLE
    messages
ADD
    COLUMN "groupMessageId" UUID REFERENCES group_messages(_id) ON DELETE CASCADE;

END IF;

END $$;

-- Migration: Add userId to messages if missing
DO $$ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'messages'
        AND column_name = 'userId'
) THEN
ALTER TABLE
    messages
ADD
    COLUMN "userId" UUID REFERENCES users(_id) ON DELETE CASCADE;

END IF;

END $$;

-- Migration: Create media_files table if missing (already handled above, belt-and-suspenders)
DO $$ BEGIN IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.tables
    WHERE
        table_name = 'media_files'
) THEN CREATE TABLE media_files (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "messageId" UUID REFERENCES messages(_id) ON DELETE CASCADE,
    "mediaType" VARCHAR(50),
    "mimeType" VARCHAR(255),
    "publicUrl" TEXT,
    "localPath" TEXT,
    "fileName" TEXT,
    "fileSize" BIGINT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

END IF;

END $$;

-- Migration: Add sessionId to contacts if missing and update unique constraint
DO $$ BEGIN -- 1. Add sessionId column if missing
IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.columns
    WHERE
        table_name = 'contacts'
        AND column_name = 'sessionId'
) THEN
ALTER TABLE
    contacts
ADD
    COLUMN "sessionId" VARCHAR(255);

-- Update existing rows with a placeholder if any
UPDATE
    contacts
SET
    "sessionId" = 'default'
WHERE
    "sessionId" IS NULL;

-- Now make it NOT NULL
ALTER TABLE
    contacts
ALTER COLUMN
    "sessionId"
SET
    NOT NULL;

END IF;

-- 2. Update unique constraint
-- Drop old constraint if exists
ALTER TABLE
    contacts DROP CONSTRAINT IF EXISTS contacts_phoneNumber_userId_key;

-- Add new constraint
IF NOT EXISTS (
    SELECT
        1
    FROM
        information_schema.table_constraints
    WHERE
        table_name = 'contacts'
        AND constraint_name = 'contacts_phone_user_session_key'
) THEN
ALTER TABLE
    contacts
ADD
    CONSTRAINT contacts_phone_user_session_key UNIQUE ("phoneNumber", "userId", "sessionId");

END IF;

END $$;