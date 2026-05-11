CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Force a clean slate for the contacts table to ensure all columns match the code
DROP TABLE IF EXISTS whatsapp_sections CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

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
