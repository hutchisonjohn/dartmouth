-- Migration: 0020_add_staff_availability_status
-- Purpose: Add availability_status column for staff (online/offline/away)
-- Date: December 3, 2025

-- Add availability_status column to staff_users
-- Values: 'online', 'offline', 'away'
ALTER TABLE staff_users ADD COLUMN availability_status TEXT DEFAULT 'offline' CHECK(availability_status IN ('online', 'offline', 'away'));

-- Add last_activity_at to track when staff was last active
ALTER TABLE staff_users ADD COLUMN last_activity_at TEXT;

-- Update existing staff to have a status based on is_available
UPDATE staff_users SET availability_status = CASE WHEN is_available = 1 THEN 'online' ELSE 'offline' END;

-- Create index for quick lookup of online staff
CREATE INDEX IF NOT EXISTS idx_staff_users_availability ON staff_users(availability_status);

