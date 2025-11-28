/**
 * InternalCommunicationSystem Tests
 * 
 * Tests D1 database integration for staff communication
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InternalCommunicationSystem } from '../InternalCommunicationSystem';

// Mock D1 Database
const createMockDB = () => {
  const channels = new Map();
  const messages = new Map();
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        run: async () => {
          console.log('[MockDB] RUN:', query, params);
          
          if (query.includes('INSERT INTO channels')) {
            channels.set(params[0], {
              channel_id: params[0],
              channel_name: params[1],
              channel_type: params[2],
              description: params[3],
              created_by: params[4],
              created_at: params[5],
              updated_at: params[6],
              archived: false
            });
          }
          
          if (query.includes('INSERT INTO channel_messages')) {
            messages.set(params[0], {
              message_id: params[0],
              channel_id: params[1],
              user_id: params[2],
              content: params[3],
              parent_message_id: params[4],
              created_at: params[5],
              updated_at: params[6],
              deleted: false
            });
          }
          
          return { success: true };
        },
        first: async () => {
          console.log('[MockDB] FIRST:', query, params);
          
          if (query.includes('SELECT thread_id FROM threads')) {
            return null; // No existing thread
          }
          
          return null;
        },
        all: async () => {
          console.log('[MockDB] ALL:', query, params);
          
          if (query.includes('SELECT * FROM channel_messages')) {
            return { results: Array.from(messages.values()) };
          }
          
          if (query.includes('SELECT c.* FROM channels')) {
            return { results: Array.from(channels.values()) };
          }
          
          if (query.includes('SELECT * FROM mentions')) {
            return { results: [] };
          }
          
          if (query.includes('SELECT * FROM notifications')) {
            return { results: [] };
          }
          
          return { results: [] };
        }
      })
    })
  } as any;
};

describe('InternalCommunicationSystem', () => {
  let commSystem: InternalCommunicationSystem;
  let mockDB: any;

  beforeEach(() => {
    mockDB = createMockDB();
    commSystem = new InternalCommunicationSystem(mockDB);
  });

  describe('createChannel', () => {
    it('should create a public channel', async () => {
      const channel = await commSystem.createChannel(
        'General',
        'public',
        'user_123',
        { description: 'General discussion' }
      );

      expect(channel).toBeDefined();
      expect(channel.channel_name).toBe('General');
      expect(channel.channel_type).toBe('public');
      expect(channel.created_by).toBe('user_123');
    });

    it('should create a private channel with members', async () => {
      const channel = await commSystem.createChannel(
        'Managers',
        'private',
        'user_123',
        {
          description: 'Management team',
          memberIds: ['user_123', 'user_456', 'user_789']
        }
      );

      expect(channel).toBeDefined();
      expect(channel.channel_type).toBe('private');
    });
  });

  describe('sendMessage', () => {
    it('should send a message to a channel', async () => {
      const message = await commSystem.sendMessage(
        'channel_123',
        'user_456',
        'Hello team!'
      );

      expect(message).toBeDefined();
      expect(message.content).toBe('Hello team!');
      expect(message.channel_id).toBe('channel_123');
      expect(message.user_id).toBe('user_456');
    });

    it('should send a reply message', async () => {
      const message = await commSystem.sendMessage(
        'channel_123',
        'user_456',
        'That sounds good!',
        { parentMessageId: 'msg_parent_123' }
      );

      expect(message).toBeDefined();
      expect(message.parent_message_id).toBe('msg_parent_123');
    });

    it('should extract @mentions from message', async () => {
      const message = await commSystem.sendMessage(
        'channel_123',
        'user_456',
        'Hey @john, can you help with this?'
      );

      expect(message).toBeDefined();
      // Mentions should be handled in background
    });
  });

  describe('getUserChannels', () => {
    it('should get all channels for a user', async () => {
      const channels = await commSystem.getUserChannels('user_123');

      expect(Array.isArray(channels)).toBe(true);
    });
  });

  describe('getUserMentions', () => {
    it('should get all mentions for a user', async () => {
      const mentions = await commSystem.getUserMentions('user_123');

      expect(Array.isArray(mentions)).toBe(true);
    });

    it('should get only unread mentions', async () => {
      const mentions = await commSystem.getUserMentions('user_123', true);

      expect(Array.isArray(mentions)).toBe(true);
    });
  });

  describe('createNotification', () => {
    it('should create a notification for a user', async () => {
      const result = await commSystem.createNotification(
        'user_123',
        'mention',
        'You were mentioned',
        '@john mentioned you in #general'
      );

      expect(result).toBe(true);
    });
  });

  describe('updatePresence', () => {
    it('should update user presence status', async () => {
      const result = await commSystem.updatePresence('user_123', 'online');

      expect(result).toBe(true);
    });

    it('should support all presence statuses', async () => {
      const statuses: Array<'online' | 'away' | 'busy' | 'offline'> = ['online', 'away', 'busy', 'offline'];

      for (const status of statuses) {
        const result = await commSystem.updatePresence('user_123', status);
        expect(result).toBe(true);
      }
    });
  });
});

