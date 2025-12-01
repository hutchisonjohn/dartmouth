/**
 * AuthenticationService Tests
 * 
 * Tests D1 database integration for authentication
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticationService } from '../AuthenticationService';

// Mock D1 Database
const createMockDB = () => {
  const users = new Map();
  
  return {
    prepare: (query: string) => ({
      bind: (...params: any[]) => ({
        run: async () => {
          console.log('[MockDB] RUN:', query, params);
          if (query.includes('INSERT INTO users')) {
            users.set(params[0], {
              user_id: params[0],
              email: params[1],
              name: params[2],
              password_hash: params[3],
              status: 'active',
              created_at: params[5],
              updated_at: params[6]
            });
          }
          return { success: true };
        },
        first: async () => {
          console.log('[MockDB] FIRST:', query, params);
          
          if (query.includes('SELECT * FROM users WHERE email')) {
            // Return test user for login
            return {
              user_id: 'user_123',
              email: params[0],
              name: 'Test User',
              password_hash: await hashPassword('password123'),
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          
          if (query.includes('SELECT * FROM users WHERE user_id')) {
            return users.get(params[0]) || {
              user_id: params[0],
              email: 'test@example.com',
              name: 'Test User',
              password_hash: 'hash',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
          
          if (query.includes('SELECT COUNT(*) as count')) {
            return { count: 1 };
          }
          
          return null;
        },
        all: async () => {
          console.log('[MockDB] ALL:', query, params);
          return { results: [] };
        }
      })
    })
  } as any;
};

// Helper to hash password (matches service implementation)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let mockDB: any;

  beforeEach(() => {
    mockDB = createMockDB();
    authService = new AuthenticationService(mockDB, 'test-secret-key');
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe('test@example.com');
    });

    it('should fail with invalid email', async () => {
      // Mock will return null for non-existent user
      mockDB.prepare = () => ({
        bind: () => ({
          first: async () => null
        })
      });

      const result = await authService.login({
        email: 'nonexistent@example.com',
        password: 'password123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const user = await authService.createUser({
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
        roleIds: ['role_agent']
      });

      expect(user).toBeDefined();
      expect(user?.email).toBe('newuser@example.com');
    });
  });

  describe('hasPermission', () => {
    it('should check if user has permission', async () => {
      mockDB.prepare = () => ({
        bind: () => ({
          first: async () => ({ count: 1 })
        })
      });

      const hasPermission = await authService.hasPermission('user_123', 'tickets', 'read');

      expect(hasPermission).toBe(true);
    });

    it('should return false if user lacks permission', async () => {
      mockDB.prepare = () => ({
        bind: () => ({
          first: async () => ({ count: 0 })
        })
      });

      const hasPermission = await authService.hasPermission('user_123', 'tickets', 'delete');

      expect(hasPermission).toBe(false);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      // First login to get a token
      const loginResult = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(loginResult.success).toBe(true);
      expect(loginResult.token).toBeDefined();

      // Then verify it
      const user = await authService.verifyToken(loginResult.token!);

      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });
  });
});

