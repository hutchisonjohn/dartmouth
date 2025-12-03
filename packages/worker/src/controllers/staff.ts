/**
 * Staff Controller
 */

import type { Context } from 'hono';
import type { Env, AuthUser } from '../types/shared';

// Simple password hashing (in production, use bcrypt or similar)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * List all staff
 */
export async function listStaff(c: Context<{ Bindings: Env }>) {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, job_title, phone, department,
             is_active, is_available, availability_status, last_activity_at, 
             avatar_url, created_at
      FROM staff_users
      WHERE is_active = TRUE
      ORDER BY 
        CASE availability_status 
          WHEN 'online' THEN 1 
          WHEN 'away' THEN 2 
          ELSE 3 
        END,
        first_name, last_name
    `).all();

    return c.json({ staff: results });
  } catch (error) {
    console.error('[Staff] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get single staff member
 */
export async function getStaff(c: Context<{ Bindings: Env }>) {
  try {
    const staffId = c.req.param('id');

    const staff = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, job_title, phone, department,
             is_active, is_available, availability_status, last_activity_at, 
             avatar_url, created_at, updated_at
      FROM staff_users
      WHERE id = ?
    `).bind(staffId).first();

    if (!staff) {
      return c.json({ error: 'Staff member not found' }, 404);
    }

    return c.json({ staff });
  } catch (error) {
    console.error('[Staff] Get error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update staff presence (legacy - kept for compatibility)
 */
export async function updatePresence(c: Context<{ Bindings: Env }>) {
  try {
    const staffId = c.req.param('id');
    const { isAvailable } = await c.req.json();

    if (isAvailable === undefined) {
      return c.json({ error: 'isAvailable required' }, 400);
    }

    const now = new Date().toISOString();
    const status = isAvailable ? 'online' : 'offline';

    await c.env.DB.prepare(`
      UPDATE staff_users
      SET is_available = ?, availability_status = ?, last_activity_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(isAvailable, status, now, now, staffId).run();

    return c.json({ message: 'Presence updated', availabilityStatus: status });
  } catch (error) {
    console.error('[Staff] Update presence error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update staff availability status (online/offline/away)
 * PUT /api/staff/:id/availability
 */
export async function updateAvailability(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const staffId = c.req.param('id');
    const { status } = await c.req.json();

    // Validate status
    if (!status || !['online', 'offline', 'away'].includes(status)) {
      return c.json({ error: 'Invalid status. Must be: online, offline, or away' }, 400);
    }

    // Only allow users to update their own status (or admins can update anyone)
    if (user.id !== staffId && user.role !== 'admin') {
      return c.json({ error: 'Not authorized to update this staff member' }, 403);
    }

    const now = new Date().toISOString();
    const isAvailable = status === 'online';

    await c.env.DB.prepare(`
      UPDATE staff_users
      SET availability_status = ?, is_available = ?, last_activity_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(status, isAvailable, now, now, staffId).run();

    console.log(`[Staff] ${staffId} availability updated to: ${status}`);

    return c.json({ 
      message: 'Availability updated', 
      availabilityStatus: status,
      isAvailable 
    });
  } catch (error) {
    console.error('[Staff] Update availability error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get current user's profile
 * GET /api/staff/me
 */
export async function getCurrentStaff(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;

    const staff = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, job_title, phone, department,
             is_active, is_available, availability_status, last_activity_at, 
             avatar_url, created_at, updated_at
      FROM staff_users
      WHERE id = ?
    `).bind(user.id).first();

    if (!staff) {
      return c.json({ error: 'Staff member not found' }, 404);
    }

    return c.json({ staff });
  } catch (error) {
    console.error('[Staff] Get current error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get online staff count
 * GET /api/staff/online-count
 */
export async function getOnlineStaffCount(c: Context<{ Bindings: Env }>) {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN availability_status = 'online' THEN 1 ELSE 0 END) as online,
        SUM(CASE WHEN availability_status = 'away' THEN 1 ELSE 0 END) as away,
        SUM(CASE WHEN availability_status = 'offline' OR availability_status IS NULL THEN 1 ELSE 0 END) as offline
      FROM staff_users
      WHERE is_active = TRUE AND id != 'ai-agent-001'
    `).first<{ total: number; online: number; away: number; offline: number }>();

    return c.json({ 
      total: result?.total || 0,
      online: result?.online || 0,
      away: result?.away || 0,
      offline: result?.offline || 0,
      anyOnline: (result?.online || 0) > 0
    });
  } catch (error) {
    console.error('[Staff] Get online count error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Create new staff member
 * POST /api/staff
 * Admin only
 */
export async function createStaff(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;

    // Only admins can create staff
    if (user.role !== 'admin') {
      return c.json({ error: 'Only administrators can create staff members' }, 403);
    }

    const body = await c.req.json();
    const { email, first_name, last_name, role, job_title, phone, department, password } = body;

    // Validate required fields
    if (!email || !first_name || !password) {
      return c.json({ error: 'Email, first name, and password are required' }, 400);
    }

    // Check if email already exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM staff_users WHERE email = ?
    `).bind(email.toLowerCase()).first();

    if (existing) {
      return c.json({ error: 'A staff member with this email already exists' }, 400);
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate ID
    const id = `staff-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO staff_users (
        id, email, password_hash, first_name, last_name, role, 
        job_title, phone, department, is_active, availability_status, 
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'offline', ?, ?)
    `).bind(
      id,
      email.toLowerCase(),
      passwordHash,
      first_name,
      last_name || '',
      role || 'agent',
      job_title || '',
      phone || '',
      department || 'Customer Service',
      now,
      now
    ).run();

    console.log(`[Staff] Created new staff member: ${email} (${id})`);

    return c.json({ 
      message: 'Staff member created successfully',
      staffId: id 
    }, 201);
  } catch (error: any) {
    console.error('[Staff] Create error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
}

/**
 * Update staff member
 * PUT /api/staff/:id
 * Admin can update anyone, staff can only update themselves (limited fields)
 */
export async function updateStaff(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const staffId = c.req.param('id');

    // Check if user can update this staff member
    const isAdmin = user.role === 'admin';
    const isSelf = user.id === staffId;

    if (!isAdmin && !isSelf) {
      return c.json({ error: 'Not authorized to update this staff member' }, 403);
    }

    // Check if staff exists
    const existing = await c.env.DB.prepare(`
      SELECT id, email FROM staff_users WHERE id = ?
    `).bind(staffId).first();

    if (!existing) {
      return c.json({ error: 'Staff member not found' }, 404);
    }

    const body = await c.req.json();
    const { email, first_name, last_name, role, job_title, phone, department, password } = body;

    // Build dynamic update query
    const updates: string[] = [];
    const values: any[] = [];

    // Fields anyone can update (for themselves)
    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name);
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name);
    }
    if (job_title !== undefined) {
      updates.push('job_title = ?');
      values.push(job_title);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone);
    }
    if (department !== undefined) {
      updates.push('department = ?');
      values.push(department);
    }
    if (password) {
      const passwordHash = await hashPassword(password);
      updates.push('password_hash = ?');
      values.push(passwordHash);
    }

    // Admin-only fields
    if (isAdmin) {
      if (email !== undefined) {
        // Check if new email is already taken by another user
        const emailTaken = await c.env.DB.prepare(`
          SELECT id FROM staff_users WHERE email = ? AND id != ?
        `).bind(email.toLowerCase(), staffId).first();

        if (emailTaken) {
          return c.json({ error: 'This email is already in use' }, 400);
        }

        updates.push('email = ?');
        values.push(email.toLowerCase());
      }
      if (role !== undefined) {
        if (!['admin', 'manager', 'agent'].includes(role)) {
          return c.json({ error: 'Invalid role. Must be: admin, manager, or agent' }, 400);
        }
        updates.push('role = ?');
        values.push(role);
      }
    }

    if (updates.length === 0) {
      return c.json({ message: 'No fields to update' });
    }

    // Add updated_at
    updates.push('updated_at = ?');
    values.push(new Date().toISOString());

    // Add staffId for WHERE clause
    values.push(staffId);

    const sql = `UPDATE staff_users SET ${updates.join(', ')} WHERE id = ?`;
    await c.env.DB.prepare(sql).bind(...values).run();

    console.log(`[Staff] Updated staff member: ${staffId}`);

    return c.json({ message: 'Staff member updated successfully' });
  } catch (error: any) {
    console.error('[Staff] Update error:', error);
    return c.json({ error: error.message || 'Internal server error' }, 500);
  }
}
