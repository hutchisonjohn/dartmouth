/**
 * Staff Controller
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';

/**
 * List all staff
 */
export async function listStaff(c: Context<{ Bindings: Env }>) {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name, role, is_active, is_available, avatar_url, created_at
      FROM staff_users
      WHERE is_active = TRUE
      ORDER BY first_name, last_name
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
      SELECT id, email, first_name, last_name, role, is_active, is_available, avatar_url, created_at, updated_at
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
 * Update staff presence
 */
export async function updatePresence(c: Context<{ Bindings: Env }>) {
  try {
    const staffId = c.req.param('id');
    const { isAvailable } = await c.req.json();

    if (isAvailable === undefined) {
      return c.json({ error: 'isAvailable required' }, 400);
    }

    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE staff_users
      SET is_available = ?, updated_at = ?
      WHERE id = ?
    `).bind(isAvailable, now, staffId).run();

    return c.json({ message: 'Presence updated' });
  } catch (error) {
    console.error('[Staff] Update presence error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


