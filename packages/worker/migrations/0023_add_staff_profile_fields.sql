-- Migration to add profile fields to staff_users table

-- Add job_title column
ALTER TABLE staff_users ADD COLUMN job_title TEXT DEFAULT '';

-- Add phone column
ALTER TABLE staff_users ADD COLUMN phone TEXT DEFAULT '';

-- Add department column
ALTER TABLE staff_users ADD COLUMN department TEXT DEFAULT 'Customer Service';

