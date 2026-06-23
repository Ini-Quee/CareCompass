-- CareCompass Database Initialization
-- This runs when the PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('patient', 'caregiver', 'admin');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE medication_status AS ENUM ('taken', 'skipped', 'snoozed', 'missed');

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE carecompass TO carecompass;
