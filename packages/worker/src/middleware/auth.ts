/**
 * Authentication Middleware
 * JWT-based authentication for API routes
 */

import type { Context, Next } from 'hono';
import type { Env } from '../types/shared';

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
}

/**
 * Verify JWT token and attach user to context
 */
export async function authenticate(c: Context<{ Bindings: Env }>, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  
  try {
    // Simple JWT verification (you can enhance this with proper JWT library)
    const user = await verifyToken(token, c.env.JWT_SECRET);
    
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    // Attach user to context
    c.set('user', user);
    
    await next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
}

/**
 * Require admin role
 */
export async function requireAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user') as AuthUser;
  
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Forbidden: Admin access required' }, 403);
  }
  
  await next();
}

/**
 * Require manager or admin role
 */
export async function requireManagerOrAdmin(c: Context<{ Bindings: Env }>, next: Next) {
  const user = c.get('user') as AuthUser;
  
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return c.json({ error: 'Forbidden: Manager or Admin access required' }, 403);
  }
  
  await next();
}

/**
 * Verify JWT token
 */
async function verifyToken(token: string, secret: string): Promise<AuthUser | null> {
  try {
    // Split token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode payload (handle base64url)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    // Verify signature (simplified - use proper JWT library in production)
    const encoder = new TextEncoder();
    const data = encoder.encode(parts[0] + '.' + parts[1]);
    const keyData = encoder.encode(secret);
    
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureData = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureData,
      data
    );

    if (!valid) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch (error) {
    console.error('[Auth] Token verification error:', error);
    return null;
  }
}

/**
 * Generate JWT token
 */
export async function generateToken(user: AuthUser, secret: string, expiresIn: number = 86400): Promise<string> {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + expiresIn
  };

  const encoder = new TextEncoder();
  
  // Encode header and payload
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  // Create signature
  const data = encoder.encode(headerB64 + '.' + payloadB64);
  const keyData = encoder.encode(secret);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${headerB64}.${payloadB64}.${signatureB64}`;
}

