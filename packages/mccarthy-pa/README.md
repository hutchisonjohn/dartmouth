# McCarthy PA Agent

**Personal Assistant Agent for Dartmouth OS**

## Overview

The McCarthy PA Agent provides intelligent personal assistant capabilities including:

- 📅 **Calendar Management** - Schedule meetings, check availability, manage events
- ✉️ **Email Assistance** - Draft emails, manage inbox, send reminders
- ✅ **Task Management** - Create tasks, set reminders, track progress
- 🗓️ **Meeting Scheduling** - Find optimal meeting times, send invites
- 📝 **Note Taking** - Capture notes, organize information

## Features

### Calendar Integration
- Google Calendar API integration
- Schedule meetings with natural language
- Check availability and conflicts
- Send calendar invites

### Email Composition
- AI-powered email drafting
- Context-aware responses
- Professional tone adjustment
- Template management

### Task Tracking
- Create and manage tasks
- Set priorities and deadlines
- Recurring task support
- Progress tracking

## Development

### Setup
```bash
npm install
npm run build
```

### Development Mode
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

## Architecture

```
mccarthy-pa/
├── src/
│   ├── McCarthyPAAgent.ts          # Main agent class
│   ├── handlers/                   # Intent handlers
│   │   ├── CalendarHandler.ts
│   │   ├── EmailHandler.ts
│   │   ├── TaskHandler.ts
│   │   └── ScheduleHandler.ts
│   ├── components/                 # Reusable components
│   │   ├── CalendarIntegration.ts
│   │   ├── EmailComposer.ts
│   │   └── TaskManager.ts
│   ├── knowledge/                  # Knowledge base
│   │   └── PA_GUIDELINES.md
│   └── index.ts                    # Package exports
```

## Usage

### Register Agent
```typescript
import { McCarthyPAAgent } from '@agent-army/mccarthy-pa';

const paAgent = new McCarthyPAAgent({
  agentId: 'mccarthy-pa',
  name: 'McCarthy PA',
  version: '1.0.0'
});

agentRegistry.register('mccarthy-pa', paAgent);
```

### Call Agent
```typescript
const response = await fetch('/api/v2/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    agentId: 'mccarthy-pa',
    message: 'Schedule a meeting for tomorrow at 2pm',
    sessionId: 'session-123',
    userId: 'user-456'
  })
});
```

## API Integration

### Google Calendar
Requires OAuth2 credentials:
```typescript
const calendarConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.GOOGLE_REDIRECT_URI
};
```

### Email Service
Supports multiple providers:
- Gmail API
- Microsoft Graph
- SMTP

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Local Testing
```bash
cd ../../worker
npx wrangler dev
```

## Contributing

See [DEVELOPER_ONBOARDING.md](../../DEVELOPER_ONBOARDING.md) for development guidelines.

## License

MIT

