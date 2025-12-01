-- PerfectPrint AI Database Schema
-- Initial migration

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  original_url TEXT NOT NULL,
  processed_url TEXT,
  svg_url TEXT,
  options TEXT NOT NULL,  -- JSON string
  metrics TEXT,           -- JSON string
  error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Sample data for testing
-- INSERT INTO jobs (id, status, original_url, options, created_at, updated_at)
-- VALUES (
--   'test-123',
--   'pending',
--   'https://example.com/test.png',
--   '{"removeBackground":true,"upscale":false,"vectorize":true}',
--   datetime('now'),
--   datetime('now')
-- );

