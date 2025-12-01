# Database Migrations

This directory contains SQL migration files for the Dartmouth Agent Army system.

## Overview

The database uses **Cloudflare D1** (SQLite-based) and consists of 8 core tables:

1. **sessions** - Conversation session metadata
2. **messages** - Individual messages within conversations
3. **semantic_memory** - Agent-level knowledge learned from conversations
4. **episodic_memory** - User-specific episodic memories
5. **documents** - Documents uploaded to the knowledge base
6. **rag_chunks** - Document chunks with embeddings for semantic search
7. **agent_analytics** - Analytics events for tracking performance
8. **feedback** - User feedback on agent responses

## Running Migrations

### Prerequisites

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Authenticate with Cloudflare:
```bash
wrangler login
```

### Create D1 Database

First, create the D1 database:

```bash
# For development
wrangler d1 create dartmouth-dev

# For production
wrangler d1 create dartmouth-prod
```

This will output a database ID. Add it to your `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "dartmouth-dev"
database_id = "your-database-id-here"
```

### Apply Migrations

Run the initial schema migration:

```bash
# For local development
wrangler d1 execute dartmouth-dev --local --file=./migrations/0001_initial_schema.sql

# For remote development database
wrangler d1 execute dartmouth-dev --remote --file=./migrations/0001_initial_schema.sql

# For production
wrangler d1 execute dartmouth-prod --remote --file=./migrations/0001_initial_schema.sql
```

### Verify Migration

Check that all tables were created:

```bash
# List all tables
wrangler d1 execute dartmouth-dev --local --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check a specific table structure
wrangler d1 execute dartmouth-dev --local --command="PRAGMA table_info(sessions);"
```

## Migration Files

### 0001_initial_schema.sql

**Created:** November 17, 2025  
**Purpose:** Initial database schema with all 8 core tables

**Tables Created:**
- sessions (with 5 indexes)
- messages (with 3 indexes)
- semantic_memory (with 3 indexes)
- episodic_memory (with 5 indexes)
- documents (with 4 indexes)
- rag_chunks (with 3 indexes)
- agent_analytics (with 6 indexes)
- feedback (with 6 indexes)

**Total:**
- 8 tables
- 35 indexes
- 4 triggers (for automatic updated_at timestamps)
- 3 foreign key constraints

## Database Schema Details

### Key Design Decisions

1. **Text-based IDs**: All primary keys use TEXT type for UUIDs/ULIDs
2. **JSON Storage**: Complex data stored as JSON strings (parsed in application)
3. **Timestamps**: ISO 8601 format strings (SQLite doesn't have native datetime)
4. **Soft Deletes**: Not implemented (use CASCADE deletes instead)
5. **Triggers**: Automatic updated_at timestamp management

### Indexes Strategy

Indexes are created for:
- All foreign keys
- Frequently queried fields (agent_id, user_id, session_id)
- Timestamp fields (for time-based queries)
- Status/category fields (for filtering)

### JSON Fields

The following fields store JSON data:
- `sessions.topics_discussed` - Array of topic strings
- `sessions.metadata` - Additional session data
- `messages.intent` - Intent detection results
- `messages.metadata` - Additional message data
- `semantic_memory.metadata` - Additional memory data
- `episodic_memory.metadata` - Additional memory data
- `documents.metadata` - Additional document data
- `rag_chunks.embedding` - Vector embedding array
- `rag_chunks.metadata` - Additional chunk data
- `agent_analytics.event_data` - Event details
- `feedback.metadata` - Additional feedback data

## Testing Migrations

### Sample Data Insertion

Test the schema with sample data:

```sql
-- Create a test session
INSERT INTO sessions (
  id, agent_id, organization_id, started_at, last_activity_at
) VALUES (
  'test-session-1', 'agent-1', 'org-1', 
  datetime('now'), datetime('now')
);

-- Create a test message
INSERT INTO messages (
  id, session_id, role, content, timestamp
) VALUES (
  'msg-1', 'test-session-1', 'user', 'Hello!', datetime('now')
);

-- Verify the data
SELECT * FROM sessions WHERE id = 'test-session-1';
SELECT * FROM messages WHERE session_id = 'test-session-1';
```

### Clean Up Test Data

```sql
DELETE FROM sessions WHERE id = 'test-session-1';
-- Messages will be automatically deleted due to CASCADE
```

## Rollback

To rollback the migration (⚠️ **DESTRUCTIVE - ALL DATA WILL BE LOST**):

```sql
-- Drop all tables
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS agent_analytics;
DROP TABLE IF EXISTS rag_chunks;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS episodic_memory;
DROP TABLE IF EXISTS semantic_memory;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS sessions;

-- Drop all triggers
DROP TRIGGER IF EXISTS update_sessions_updated_at;
DROP TRIGGER IF EXISTS update_semantic_memory_updated_at;
DROP TRIGGER IF EXISTS update_episodic_memory_updated_at;
DROP TRIGGER IF EXISTS update_documents_updated_at;
```

## Future Migrations

When creating new migrations:

1. Name files sequentially: `0002_description.sql`, `0003_description.sql`, etc.
2. Include both UP and DOWN migrations
3. Test locally before applying to production
4. Document all changes in this README
5. Update the DatabaseManager class if schema changes

## Troubleshooting

### Error: "table already exists"

The migration has already been run. Check existing tables:
```bash
wrangler d1 execute dartmouth-dev --local --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### Error: "no such table"

The migration hasn't been run yet. Apply it using the commands above.

### Error: "FOREIGN KEY constraint failed"

Ensure parent records exist before inserting child records:
- Sessions must exist before inserting messages
- Documents must exist before inserting rag_chunks

### Performance Issues

If queries are slow:
1. Check that indexes are created: `PRAGMA index_list(table_name);`
2. Analyze query plans: `EXPLAIN QUERY PLAN SELECT ...;`
3. Consider adding more indexes for specific query patterns

## Resources

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues or questions:
1. Check the main project README
2. Review the DARTMOUTH_FOUNDATION_DEEP_DIVE.md document
3. Consult the AGENT_ARMY_SYSTEM.md specification

