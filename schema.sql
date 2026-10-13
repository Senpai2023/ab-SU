-- ==============================================================================
-- Ab!SU: University Emergency & Advisory SMS Notification System
-- Database Schema Definition & Migration (PostgreSQL / MySQL compatible DDL)
-- ==============================================================================

-- 1. EXTENSIONS (PostgreSQL only - ignored in MySQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE (Campus Communication Officers, Admins & DRRM Staff)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'officer' CHECK (role IN ('admin', 'officer', 'staff')),
    department VARCHAR(160) NOT NULL DEFAULT 'Public Information Office',
    phone_number VARCHAR(32),
    avatar_url VARCHAR(512),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 3. RECIPIENTS TABLE (Students, Faculty & Campus Subscribers)
CREATE TABLE IF NOT EXISTS recipients (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(160) NOT NULL,
    phone_number VARCHAR(32) NOT NULL, -- E.164 formatted (e.g., +639171234567)
    college VARCHAR(120) NOT NULL,     -- e.g. 'CCIS', 'CEGS', 'CAS', 'CED'
    program VARCHAR(160),              -- e.g. 'BS Computer Science'
    year_level INT DEFAULT 1,
    consent_status VARCHAR(32) NOT NULL DEFAULT 'OPTED_IN' CHECK (consent_status IN ('OPTED_IN', 'OPTED_OUT', 'PENDING')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipients_phone ON recipients(phone_number);
CREATE INDEX idx_recipients_college ON recipients(college);
CREATE INDEX idx_recipients_status ON recipients(consent_status, is_active);

-- 4. ANNOUNCEMENTS TABLE (Broadcast Dispatches & SMS Logs)
CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(64) NOT NULL CHECK (category IN (
        'SUSPENSION NOTICE',
        'HEAT ADVISORY',
        'RAINFALL ADVISORY',
        'AIR QUALITY',
        'CAMPUS EMERGENCY'
    )),
    sub_category VARCHAR(64) NOT NULL,
    reference_url VARCHAR(512) NOT NULL,
    memo_number VARCHAR(64),
    event_date VARCHAR(64),
    temperature VARCHAR(32),
    sender_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    sender_name VARCHAR(120) NOT NULL,
    recipient_count INT NOT NULL DEFAULT 0,
    delivery_success_count INT NOT NULL DEFAULT 0,
    delivery_rate NUMERIC(5,2) DEFAULT 0.00,
    sms_segments INT NOT NULL DEFAULT 1,
    gateway_used VARCHAR(64) NOT NULL DEFAULT 'semaphore',
    target_colleges TEXT, -- JSON array string or comma separated
    status VARCHAR(32) NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'delivering', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_sent_at ON announcements(sent_at DESC);
CREATE INDEX idx_announcements_sender ON announcements(sender_id);

-- 5. BROADCAST DISPATCH LOGS (Per-recipient SMS transmission telemetry)
CREATE TABLE IF NOT EXISTS broadcast_delivery_logs (
    id VARCHAR(36) PRIMARY KEY,
    announcement_id VARCHAR(36) NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    recipient_id VARCHAR(36) NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    phone_number VARCHAR(32) NOT NULL,
    carrier VARCHAR(32), -- e.g. Globe, Smart, DITO
    status VARCHAR(32) NOT NULL DEFAULT 'DELIVERED' CHECK (status IN ('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED')),
    gateway_message_id VARCHAR(128),
    cost_credits NUMERIC(6,3) DEFAULT 1.000,
    error_message TEXT,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_delivery_logs_announcement ON broadcast_delivery_logs(announcement_id);
CREATE INDEX idx_delivery_logs_status ON broadcast_delivery_logs(status);

-- 6. SYSTEM AUDIT LOGS (Security and Authorization tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) REFERENCES users(id),
    action VARCHAR(64) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(64),
    ip_address VARCHAR(64),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

INSERT INTO users (id, name, email, password_hash, role, department)
VALUES 
    ('usr-admin-01', 'Dr. Maria Elena Santos', 'admin@carsu.edu.ph', '$2a$12$e8Yk2wQ6...hash', 'admin', 'University Administration'),
    ('usr-pio-01', 'Officer Justin Cruz', 'pio.cruz@carsu.edu.ph', '$2a$12$p4Lk7xR1...hash', 'officer', 'Public Information Office'),
    ('usr-drrm-01', 'Staff Roberto Dela Cruz', 'drrm.roberto@carsu.edu.ph', '$2a$12$a9Xz1mK3...hash', 'staff', 'Disaster Risk Reduction Unit')
ON CONFLICT (email) DO NOTHING;
