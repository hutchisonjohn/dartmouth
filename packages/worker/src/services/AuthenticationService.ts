/**
 * Authentication Service
 * 
 * Handles user authentication, JWT tokens, and RBAC with D1 persistence.
 * 
 * Features:
 * - Login/logout
 * - JWT token generation/validation
 * - Role-Based Access Control (RBAC)
 * - User management
 * - Permission checking
 * 
 * Created: Nov 28, 2025
 * Updated: Nov 28, 2025 - D1 integration
 */

import type { D1Database } from '@cloudflare/workers-types';

export interface User {
  user_id: string;
  email: string;
  name: string;
  password_hash: string;
  avatar_url?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface Role {
  role_id: string;
  role_name: string;
  description?: string;
}

export interface Permission {
  permission_id: string;
  permission_name: string;
  description?: string;
  resource: string;
  action: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: Omit<User, 'password_hash'>;
  expiresAt?: string;
  error?: string;
}

/**
 * Authentication Service
 */
export class AuthenticationService {
  private db: D1Database;
  private jwtSecret: string;
  private tokenExpiry: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(db: D1Database, jwtSecret: string) {
    this.db = db;
    this.jwtSecret = jwtSecret;
    console.log('[AuthenticationService] Initialized with D1 database');
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResult> {
    console.log(`[AuthenticationService] Login attempt: ${credentials.email}`);

    try {
      // Find user by email
      const user = await this.db.prepare(`
        SELECT * FROM users WHERE email = ?
      `).bind(credentials.email).first() as User | null;

      if (!user) {
        console.log(`[AuthenticationService] ❌ User not found: ${credentials.email}`);
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(credentials.password, user.password_hash);

      if (!passwordValid) {
        console.log(`[AuthenticationService] ❌ Invalid password for: ${credentials.email}`);
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if user is active
      if (user.status !== 'active') {
        console.log(`[AuthenticationService] ❌ User not active: ${credentials.email} (${user.status})`);
        return {
          success: false,
          error: 'Account is not active'
        };
      }

      // Generate JWT token
      const token = await this.generateToken(user);

      const expiresAt = new Date(Date.now() + this.tokenExpiry).toISOString();

      console.log(`[AuthenticationService] ✅ Login successful: ${credentials.email}`);
      return {
        success: true,
        token,
        user: this.sanitizeUser(user),
        expiresAt
      };

    } catch (error) {
      console.error('[AuthenticationService] Login error:', error);
      return {
        success: false,
        error: 'An error occurred during login'
      };
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<User | null> {
    try {
      const payload = await this.decodeToken(token);
      
      if (!payload || !payload.userId) {
        return null;
      }

      // Check if token is expired
      if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
        console.log('[AuthenticationService] ❌ Token expired');
        return null;
      }

      // Get user from database
      const user = await this.db.prepare(`
        SELECT * FROM users WHERE user_id = ?
      `).bind(payload.userId).first() as User | null;

      if (!user || user.status !== 'active') {
        return null;
      }

      return user;
    } catch (error) {
      console.error('[AuthenticationService] Token verification error:', error);
      return null;
    }
  }

  /**
   * Get user permissions
   */
  async getPermissions(userId: string): Promise<Permission[]> {
    try {
      const result = await this.db.prepare(`
        SELECT DISTINCT p.*
        FROM permissions p
        JOIN role_permissions rp ON p.permission_id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `).bind(userId).all();

      return result.results as Permission[];
    } catch (error) {
      console.error('[AuthenticationService] Error fetching permissions:', error);
      return [];
    }
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      const result = await this.db.prepare(`
        SELECT COUNT(*) as count
        FROM permissions p
        JOIN role_permissions rp ON p.permission_id = rp.permission_id
        JOIN user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ? AND p.resource = ? AND p.action = ?
      `).bind(userId, resource, action).first();

      return (result?.count as number) > 0;
    } catch (error) {
      console.error('[AuthenticationService] Error checking permission:', error);
      return false;
    }
  }

  /**
   * Create new user
   */
  async createUser(userData: {
    email: string;
    name: string;
    password: string;
    roleIds?: string[];
  }): Promise<User | null> {
    try {
      const userId = this.generateUserId();
      const passwordHash = await this.hashPassword(userData.password);
      const now = new Date().toISOString();

      // Insert user
      await this.db.prepare(`
        INSERT INTO users (user_id, email, name, password_hash, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'active', ?, ?)
      `).bind(userId, userData.email, userData.name, passwordHash, now, now).run();

      // Assign roles
      if (userData.roleIds && userData.roleIds.length > 0) {
        for (const roleId of userData.roleIds) {
          await this.db.prepare(`
            INSERT INTO user_roles (user_id, role_id, assigned_at)
            VALUES (?, ?, ?)
          `).bind(userId, roleId, now).run();
        }
      }

      console.log(`[AuthenticationService] ✅ User created: ${userData.email}`);

      return await this.getUser(userId);
    } catch (error) {
      console.error('[AuthenticationService] Error creating user:', error);
      return null;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    try {
      const user = await this.db.prepare(`
        SELECT * FROM users WHERE user_id = ?
      `).bind(userId).first() as User | null;

      return user;
    } catch (error) {
      console.error('[AuthenticationService] Error fetching user:', error);
      return null;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const sets: string[] = [];
      const values: any[] = [];

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && key !== 'user_id' && key !== 'password_hash') {
          sets.push(`${key} = ?`);
          values.push(value);
        }
      });

      if (sets.length === 0) return false;

      sets.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(userId);

      await this.db.prepare(`
        UPDATE users SET ${sets.join(', ')} WHERE user_id = ?
      `).bind(...values).run();

      console.log(`[AuthenticationService] ✅ User updated: ${userId}`);
      return true;
    } catch (error) {
      console.error('[AuthenticationService] Error updating user:', error);
      return false;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        DELETE FROM users WHERE user_id = ?
      `).bind(userId).run();

      console.log(`[AuthenticationService] ✅ User deleted: ${userId}`);
      return true;
    } catch (error) {
      console.error('[AuthenticationService] Error deleting user:', error);
      return false;
    }
  }

  /**
   * Generate JWT token
   */
  private async generateToken(user: User): Promise<string> {
    const payload = {
      userId: user.user_id,
      email: user.email,
      name: user.name,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + this.tokenExpiry).toISOString()
    };

    // Simple JWT implementation (in production, use a proper JWT library)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = btoa(JSON.stringify(payload));
    const signature = await this.sign(`${header}.${body}`, this.jwtSecret);

    return `${header}.${body}.${signature}`;
  }

  /**
   * Decode JWT token
   */
  private async decodeToken(token: string): Promise<any> {
    try {
      const [header, body, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = await this.sign(`${header}.${body}`, this.jwtSecret);
      if (signature !== expectedSignature) {
        console.log('[AuthenticationService] ❌ Invalid token signature');
        return null;
      }

      return JSON.parse(atob(body));
    } catch (error) {
      console.error('[AuthenticationService] Token decode error:', error);
      return null;
    }
  }

  /**
   * Sign data with secret
   */
  private async sign(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Hash password
   */
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(hash)));
  }

  /**
   * Verify password
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  /**
   * Sanitize user (remove sensitive data)
   */
  private sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Generate user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  }
}
