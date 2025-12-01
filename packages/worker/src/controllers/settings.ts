/**
 * Settings Controller
 */

import type { Context } from 'hono';
import type { Env } from '../types/shared';
import type { AuthUser } from '../middleware/auth';

/**
 * List all settings
 */
export async function listSettings(c: Context<{ Bindings: Env }>) {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, setting_key, setting_value, setting_type, description, updated_at
      FROM system_settings
      ORDER BY setting_key
    `).all();

    return c.json({ settings: results });
  } catch (error) {
    console.error('[Settings] List error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get single setting
 */
export async function getSetting(c: Context<{ Bindings: Env }>) {
  try {
    const key = c.req.param('key');

    const setting = await c.env.DB.prepare(`
      SELECT id, setting_key, setting_value, setting_type, description, updated_at
      FROM system_settings
      WHERE setting_key = ?
    `).bind(key).first();

    if (!setting) {
      return c.json({ error: 'Setting not found' }, 404);
    }

    return c.json({ setting });
  } catch (error) {
    console.error('[Settings] Get error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update setting
 */
export async function updateSetting(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as AuthUser;
    const key = c.req.param('key');
    const { value } = await c.req.json();

    if (value === undefined) {
      return c.json({ error: 'value required' }, 400);
    }

    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE system_settings
      SET setting_value = ?, updated_by = ?, updated_at = ?
      WHERE setting_key = ?
    `).bind(value, user.id, now, key).run();

    return c.json({ message: 'Setting updated' });
  } catch (error) {
    console.error('[Settings] Update error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}


