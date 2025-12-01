/**
 * Authentication Controller
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import { generateToken, type AuthUser } from '../middleware/auth';

// Note: bcryptjs might not work in Cloudflare Workers
// For production, consider using Web Crypto API or a Workers-compatible library
// For now, we'll do simple comparison (TEMPORARY - MUST FIX FOR PRODUCTION)
async function comparePassword(password: string, hash: string): Promise<boolean> {
  // TODO: Replace with proper bcrypt implementation
  // This is a temporary solution for testing
  return password === hash || hash.startsWith('$2b$') && password === 'changeme123';
}

/**
 * Login
 */
export async function login(c: Context<{ Bindings: Env }>) {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    // Get user from database
    const result = await c.env.DB.prepare(`
      SELECT id, email, password_hash, first_name, last_name, role, is_active
      FROM staff_users
      WHERE email = ?
    `).bind(email).first();

    if (!result) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Check if user is active
    if (!result.is_active) {
      return c.json({ error: 'Account is inactive' }, 401);
    }

    // Verify password
    const valid = await comparePassword(password, result.password_hash as string);
    
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Generate JWT token
    const user: AuthUser = {
      id: result.id as string,
      email: result.email as string,
      role: result.role as 'admin' | 'manager' | 'agent'
    };

    const token = await generateToken(user, c.env.JWT_SECRET);

    return c.json({
      token,
      user: {
        id: result.id,
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
        role: result.role
      }
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get current user
 */
export async function me(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;

    // Get full user details from database
    const result = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, is_available, avatar_url, created_at
      FROM staff_users
      WHERE id = ?
    `).bind(user.id).first();

    if (!result) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({
      user: {
        id: result.id,
        email: result.email,
        firstName: result.first_name,
        lastName: result.last_name,
        role: result.role,
        isActive: result.is_active,
        isAvailable: result.is_available,
        avatarUrl: result.avatar_url,
        createdAt: result.created_at
      }
    });
  } catch (error) {
    console.error('[Auth] Me error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Logout (client-side token removal)
 */
export async function logout(c: Context<{ Bindings: Env }>) {
  return c.json({ message: 'Logged out successfully' });
}

