CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -- Force a clean slate for the contacts table to ensure all columns match the code
-- DROP TABLE IF EXISTS whatsapp_sections CASCADE;
-- DROP TABLE IF EXISTS contacts CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS group_messages CASCADE;
-- DROP TABLE IF EXISTS chat_messages CASCADE;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts Table (Recreated to ensure "userId" and "phoneNumber" columns exist with correct casing)
CREATE TABLE IF NOT EXISTS contacts (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "whatsappId" VARCHAR(100),
    lid VARCHAR(255),
    name VARCHAR(255),

    "pushName" VARCHAR(255),
    "phoneNumber" VARCHAR(20) NOT NULL,
    "userId" UUID NOT NULL REFERENCES users(_id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("phoneNumber", "userId")
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

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" VARCHAR(255) NOT NULL,
    "whatsappId" VARCHAR(255) UNIQUE NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    body TEXT,
    "type" VARCHAR(50) DEFAULT 'chat',
    "fromMe" BOOLEAN DEFAULT false,
    timestamp BIGINT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Group Messages Table
CREATE TABLE IF NOT EXISTS group_messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" VARCHAR(255) NOT NULL,
    "whatsappId" VARCHAR(255) UNIQUE NOT NULL,
    "from" VARCHAR(255) NOT NULL,
    "to" VARCHAR(255) NOT NULL,
    body TEXT,
    "type" VARCHAR(50) DEFAULT 'chat',
    "fromMe" BOOLEAN DEFAULT false,
    timestamp BIGINT,
    "rawData" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Master/Linking Table)
CREATE TABLE IF NOT EXISTS messages (
    _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sessionId" VARCHAR(255) NOT NULL,
    "userId" UUID REFERENCES users(_id) ON DELETE CASCADE,
    "chatMessageId" UUID REFERENCES chat_messages(_id) ON DELETE CASCADE,
    "groupMessageId" UUID REFERENCES group_messages(_id) ON DELETE CASCADE,
    "whatsappId" VARCHAR(255) UNIQUE NOT NULL,
    "rawData" JSONB,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Add lid column to contacts if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='lid') THEN
        ALTER TABLE contacts ADD COLUMN lid VARCHAR(255);
    END IF;
END $$;

-- Migration: Ensure chat_messages and group_messages exist with correct structure
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='chat_messages') THEN
        CREATE TABLE chat_messages (
            _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "sessionId" VARCHAR(255) NOT NULL,
            "whatsappId" VARCHAR(255) UNIQUE NOT NULL,
            "from" VARCHAR(255) NOT NULL,
            "to" VARCHAR(255) NOT NULL,
            body TEXT,
            "type" VARCHAR(50) DEFAULT 'chat',
            "fromMe" BOOLEAN DEFAULT false,
            timestamp BIGINT,
            "rawData" JSONB,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='group_messages') THEN
        CREATE TABLE group_messages (
            _id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            "sessionId" VARCHAR(255) NOT NULL,
            "whatsappId" VARCHAR(255) UNIQUE NOT NULL,
            "from" VARCHAR(255) NOT NULL,
            "to" VARCHAR(255) NOT NULL,
            body TEXT,
            "type" VARCHAR(50) DEFAULT 'chat',
            "fromMe" BOOLEAN DEFAULT false,
            timestamp BIGINT,
            "rawData" JSONB,
            "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Migration: Update master messages table structure
DO $$ 
BEGIN 
    -- Add linking columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='userId') THEN
        ALTER TABLE messages ADD COLUMN "userId" UUID REFERENCES users(_id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='chatMessageId') THEN
        ALTER TABLE messages ADD COLUMN "chatMessageId" UUID REFERENCES chat_messages(_id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='groupMessageId') THEN
        ALTER TABLE messages ADD COLUMN "groupMessageId" UUID REFERENCES group_messages(_id) ON DELETE CASCADE;
    END IF;

    -- Optional: Remove old columns if you want to be strict, but safer to keep them for a while
    -- ALTER TABLE messages DROP COLUMN IF EXISTS "from";
    -- ALTER TABLE messages DROP COLUMN IF EXISTS "to";
    -- ALTER TABLE messages DROP COLUMN IF EXISTS "body";
END $$;

