import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, FileCode, CheckCircle2 } from 'lucide-react';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SCHEMA_SQL = `-- ==============================================================================
-- Ab!SU: University Emergency & Advisory SMS Notification System
-- PostgreSQL & MySQL DDL Schema Definition
-- ==============================================================================

-- 1. USERS TABLE (Campus Communication Officers, Admins & DRRM Staff)
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

-- 2. RECIPIENTS TABLE (Students, Faculty & Campus Subscribers)
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

-- 3. ANNOUNCEMENTS TABLE (Broadcast Dispatches & SMS Logs)
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
    target_colleges TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'delivering', 'sent', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_announcements_category ON announcements(category);
CREATE INDEX idx_announcements_sent_at ON announcements(sent_at DESC);
CREATE INDEX idx_announcements_sender ON announcements(sender_id);

-- 4. DELIVERY TELEMETRY LOGS (Per-recipient SMS carrier delivery)
CREATE TABLE IF NOT EXISTS broadcast_delivery_logs (
    id VARCHAR(36) PRIMARY KEY,
    announcement_id VARCHAR(36) NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    recipient_id VARCHAR(36) NOT NULL REFERENCES recipients(id) ON DELETE CASCADE,
    phone_number VARCHAR(32) NOT NULL,
    carrier VARCHAR(32), -- Globe, Smart, DITO
    status VARCHAR(32) NOT NULL DEFAULT 'DELIVERED',
    cost_credits NUMERIC(6,3) DEFAULT 1.000,
    dispatched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`;

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#D00000]" />
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                SQL Database Schema & Migration Specification
              </h3>
              <p className="text-xs text-neutral-500">
                Relational schema covering users, recipients, announcements, and delivery logs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied DDL
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy SQL
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-y-auto bg-neutral-900 font-mono text-xs text-neutral-200 leading-relaxed select-text">
          <pre>{SCHEMA_SQL}</pre>
        </div>

        {/* Footer info */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 text-xs text-neutral-500 flex items-center justify-between">
          <span>Target engines: PostgreSQL 14+, MySQL 8+, SQLite3</span>
          <span className="font-semibold text-neutral-700">File location: /schema.sql</span>
        </div>
      </div>
    </div>
  );
};
