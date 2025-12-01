# 🎼 Dartmouth OS V2.0 - Core Package

**The Operating System & Heart of the AI Agent Fleet**

## Overview

Dartmouth OS V2.0 is the platform operating system that provides infrastructure, services, and orchestration for all McCarthy AI agents.

## Features

- **Agent Registry** - Register, discover, and manage agents
- **API Gateway** - Route requests to appropriate agents
- **Health Monitoring** - Track agent health and performance
- **Type Safety** - Full TypeScript support
- **Error Handling** - Standardized error classes
- **Logging** - Centralized logging utility

## Installation

```bash
npm install @dartmouth/core
```

## Quick Start

```typescript
import { DartmouthOS, Agent, AgentRequest, AgentResponse } from '@dartmouth/core';

// Create Dartmouth OS instance
const dartmouth = new DartmouthOS(env, {
  environment: 'production',
  enableHealthMonitoring: true,
  healthCheckInterval: 60000,
});

// Initialize
await dartmouth.initialize();

// Register an agent
const myAgent: Agent = {
  id: 'my-agent',
  name: 'My Agent',
  version: '1.0.0',
  description: 'My custom agent',
  capabilities: [],
  status: 'active',
  
  async processMessage(request: AgentRequest): Promise<AgentResponse> {
    return {
      content: `Hello! You said: ${request.message}`,
      type: 'text',
    };
  },
  
  async healthCheck() {
    return {
      agentId: 'my-agent',
      status: 'healthy',
      responseTime: 10,
      errorCount: 0,
      successCount: 100,
      lastCheck: Date.now(),
    };
  },
};

dartmouth.registerAgent(myAgent);

// Handle requests
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return await dartmouth.handleRequest(request);
  },
};
```

## API

### DartmouthOS

Main class for Dartmouth OS.

#### Constructor

```typescript
new DartmouthOS(env: Env, config?: DartmouthOSConfig)
```

#### Methods

- `initialize()` - Initialize Dartmouth OS
- `shutdown()` - Shutdown Dartmouth OS
- `registerAgent(agent: Agent)` - Register an agent
- `unregisterAgent(agentId: string)` - Unregister an agent
- `handleRequest(request: Request)` - Handle HTTP request
- `getAgentRegistry()` - Get agent registry
- `getHealthMonitor()` - Get health monitor
- `getStatus()` - Get system status

### AgentRegistry

Manage agent registration and discovery.

#### Methods

- `register(agent: Agent)` - Register an agent
- `unregister(agentId: string)` - Unregister an agent
- `get(agentId: string)` - Get an agent by ID
- `has(agentId: string)` - Check if agent is registered
- `getAll()` - Get all registered agents
- `getStats()` - Get agent statistics

### APIGateway

Route requests to appropriate agents.

#### Methods

- `handleRequest(request: Request)` - Handle HTTP request

### HealthMonitor

Monitor agent health and performance.

#### Methods

- `start()` - Start monitoring
- `stop()` - Stop monitoring
- `getHealthSummary()` - Get health summary
- `checkAgent(agentId: string)` - Force health check for specific agent

## API Endpoints

### POST /api/v2/chat

Send a message to an agent.

**Request:**
```json
{
  "agentId": "my-agent",
  "message": "Hello!",
  "sessionId": "session-123",
  "userId": "user-456",
  "history": [],
  "context": {}
}
```

**Response:**
```json
{
  "content": "Hello! How can I help you?",
  "type": "text",
  "intent": "greeting",
  "metadata": {
    "timestamp": 1700000000000,
    "processingTime": 150
  }
}
```

### GET /api/v2/health

Get health status of all agents.

**Response:**
```json
{
  "status": "healthy",
  "agents": [
    {
      "agentId": "my-agent",
      "status": "healthy",
      "responseTime": 10,
      "errorCount": 0,
      "successCount": 100,
      "lastCheck": 1700000000000
    }
  ],
  "timestamp": 1700000000000
}
```

### GET /api/v2/agents

Get list of all registered agents.

**Response:**
```json
{
  "total": 3,
  "healthy": 3,
  "unhealthy": 0,
  "unknown": 0,
  "agents": [
    {
      "id": "my-agent",
      "name": "My Agent",
      "status": "active",
      "healthStatus": "healthy",
      "registeredAt": 1700000000000,
      "lastCheck": 1700000000000
    }
  ]
}
```

## License

MIT

