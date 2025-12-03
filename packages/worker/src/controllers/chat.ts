/**
 * Chat Controller
 * Handles business hours, chat settings, and chat status
 */

import type { Context } from 'hono';
import type { Env, AuthUser } from '../types/shared';

const DEFAULT_TENANT = 'test-tenant-dtf';

interface BusinessHour {
  id: string;
  tenant_id: string;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
}

interface ChatWidgetSettings {
  id: string;
  tenant_id: string;
  is_enabled: boolean;
  primary_color: string;
  secondary_color: string;
  button_text: string;
  welcome_message: string;
  offline_message: string;
  timezone: string;
  show_business_hours: boolean;
  require_email_when_offline: boolean;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Get chat widget settings
 * GET /api/chat/settings
 */
export async function getChatSettings(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = DEFAULT_TENANT;

    const settings = await c.env.DB.prepare(`
      SELECT * FROM chat_widget_settings WHERE tenant_id = ?
    `).bind(tenantId).first<ChatWidgetSettings>();

    if (!settings) {
      // Return defaults if no settings exist
      return c.json({
        settings: {
          is_enabled: true,
          primary_color: '#1e40af',
          secondary_color: '#ffffff',
          button_text: 'Chat with us',
          welcome_message: 'Hi! How can we help you today?',
          offline_message: 'Our team is currently offline. Please leave a message.',
          timezone: 'Australia/Sydney',
          show_business_hours: true,
          require_email_when_offline: true
        }
      });
    }

    return c.json({ settings });
  } catch (error) {
    console.error('[Chat] Get settings error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update chat widget settings
 * PUT /api/chat/settings
 */
export async function updateChatSettings(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = DEFAULT_TENANT;
    const body = await c.req.json();

    console.log('[Chat] Updating settings, received:', JSON.stringify(body));

    const now = new Date().toISOString();

    // Check if settings exist
    const existing = await c.env.DB.prepare(`
      SELECT * FROM chat_widget_settings WHERE tenant_id = ?
    `).bind(tenantId).first<any>();

    // Build dynamic update - only update fields that were provided
    const updates: string[] = [];
    const values: any[] = [];

    const fieldMap: Record<string, string> = {
      is_enabled: 'is_enabled',
      primary_color: 'primary_color',
      secondary_color: 'secondary_color',
      button_text: 'button_text',
      welcome_message: 'welcome_message',
      offline_message: 'offline_message',
      timezone: 'timezone',
      show_business_hours: 'show_business_hours',
      require_email_when_offline: 'require_email_when_offline'
    };

    for (const [key, column] of Object.entries(fieldMap)) {
      if (body[key] !== undefined) {
        updates.push(`${column} = ?`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return c.json({ message: 'No fields to update' });
    }

    if (existing) {
      // Update existing
      updates.push('updated_at = ?');
      values.push(now);
      values.push(tenantId);

      const sql = `UPDATE chat_widget_settings SET ${updates.join(', ')} WHERE tenant_id = ?`;
      console.log('[Chat] Running update SQL:', sql, 'with values:', values);
      await c.env.DB.prepare(sql).bind(...values).run();
    } else {
      // Insert new with defaults
      const id = `cws-${crypto.randomUUID().slice(0, 8)}`;
      await c.env.DB.prepare(`
        INSERT INTO chat_widget_settings (id, tenant_id, is_enabled, primary_color, secondary_color, button_text, welcome_message, offline_message, timezone, show_business_hours, require_email_when_offline, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        tenantId,
        body.is_enabled ?? true,
        body.primary_color ?? '#1e40af',
        body.secondary_color ?? '#ffffff',
        body.button_text ?? 'Chat with us',
        body.welcome_message ?? 'Hi! How can we help you today?',
        body.offline_message ?? 'Our team is currently offline.',
        body.timezone ?? 'Australia/Sydney',
        body.show_business_hours ?? true,
        body.require_email_when_offline ?? true,
        now,
        now
      ).run();
    }

    console.log('[Chat] Settings updated for tenant:', tenantId);
    return c.json({ message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('[Chat] Update settings error:', error.message, error.stack);
    return c.json({ error: `Failed to update settings: ${error.message}` }, 500);
  }
}

/**
 * Get business hours
 * GET /api/chat/business-hours
 */
export async function getBusinessHours(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = DEFAULT_TENANT;

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM business_hours WHERE tenant_id = ? ORDER BY day_of_week
    `).bind(tenantId).all<BusinessHour>();

    // Format with day names
    const hours = results.map(h => ({
      ...h,
      day_name: DAY_NAMES[h.day_of_week]
    }));

    return c.json({ businessHours: hours });
  } catch (error) {
    console.error('[Chat] Get business hours error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Update business hours
 * PUT /api/chat/business-hours
 */
export async function updateBusinessHours(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = DEFAULT_TENANT;
    const body = await c.req.json();
    const { hours } = body;

    console.log('[Chat] Updating business hours, received:', JSON.stringify(body));

    if (!hours || !Array.isArray(hours)) {
      console.log('[Chat] Invalid hours data:', hours);
      return c.json({ error: 'hours array is required' }, 400);
    }

    const now = new Date().toISOString();

    for (const hour of hours) {
      const { day_of_week, is_open, open_time, close_time } = hour;

      console.log(`[Chat] Processing day ${day_of_week}: is_open=${is_open}, open=${open_time}, close=${close_time}`);

      if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
        console.log(`[Chat] Skipping invalid day_of_week: ${day_of_week}`);
        continue;
      }

      // Check if exists
      const existing = await c.env.DB.prepare(`
        SELECT id FROM business_hours WHERE tenant_id = ? AND day_of_week = ?
      `).bind(tenantId, day_of_week).first();

      if (existing) {
        console.log(`[Chat] Updating existing record for day ${day_of_week}`);
        await c.env.DB.prepare(`
          UPDATE business_hours
          SET is_open = ?, open_time = ?, close_time = ?, updated_at = ?
          WHERE tenant_id = ? AND day_of_week = ?
        `).bind(is_open ? 1 : 0, open_time, close_time, now, tenantId, day_of_week).run();
      } else {
        console.log(`[Chat] Inserting new record for day ${day_of_week}`);
        const id = `bh-${tenantId.slice(0, 8)}-${day_of_week}`;
        await c.env.DB.prepare(`
          INSERT INTO business_hours (id, tenant_id, day_of_week, is_open, open_time, close_time, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(id, tenantId, day_of_week, is_open ? 1 : 0, open_time, close_time, now, now).run();
      }
    }

    console.log('[Chat] Business hours updated successfully for tenant:', tenantId);
    return c.json({ message: 'Business hours updated successfully' });
  } catch (error: any) {
    console.error('[Chat] Update business hours error:', error.message, error.stack);
    return c.json({ error: `Failed to update: ${error.message}` }, 500);
  }
}

/**
 * Get chat status (public endpoint for widget)
 * GET /api/chat/status
 * Returns: isOnline, businessHours, staffOnline count
 */
export async function getChatStatus(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = DEFAULT_TENANT;

    // Get chat settings
    const settings = await c.env.DB.prepare(`
      SELECT * FROM chat_widget_settings WHERE tenant_id = ?
    `).bind(tenantId).first<ChatWidgetSettings>();

    if (!settings?.is_enabled) {
      return c.json({
        isOnline: false,
        reason: 'Chat is disabled',
        settings: null
      });
    }

    // Get business hours
    const { results: businessHours } = await c.env.DB.prepare(`
      SELECT * FROM business_hours WHERE tenant_id = ? ORDER BY day_of_week
    `).bind(tenantId).all<BusinessHour>();

    // Check if within business hours
    const now = new Date();
    const timezone = settings.timezone || 'Australia/Sydney';
    
    // Get current time in the configured timezone
    const formatter = new Intl.DateTimeFormat('en-AU', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      weekday: 'short'
    });
    const parts = formatter.formatToParts(now);
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    const dayPart = parts.find(p => p.type === 'weekday');
    
    const currentHour = parseInt(hourPart?.value || '0');
    const currentMinute = parseInt(minutePart?.value || '0');
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
    
    // Map weekday to day_of_week (0=Sunday)
    const dayMap: Record<string, number> = { 'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6 };
    const currentDayOfWeek = dayMap[dayPart?.value || 'Mon'] ?? 1;

    const todayHours = businessHours.find(h => h.day_of_week === currentDayOfWeek);
    
    let withinBusinessHours = false;
    if (todayHours?.is_open && todayHours.open_time && todayHours.close_time) {
      withinBusinessHours = currentTime >= todayHours.open_time && currentTime < todayHours.close_time;
    }

    // Get online staff count
    const staffCount = await c.env.DB.prepare(`
      SELECT COUNT(*) as count FROM staff_users 
      WHERE is_active = TRUE 
        AND availability_status = 'online' 
        AND id != 'ai-agent-001'
    `).first<{ count: number }>();

    const staffOnline = staffCount?.count || 0;

    // Format business hours for display
    const formattedHours = businessHours.map(h => ({
      day: DAY_NAMES[h.day_of_week],
      is_open: h.is_open,
      hours: h.is_open && h.open_time && h.close_time 
        ? `${h.open_time} - ${h.close_time}` 
        : 'Closed'
    }));

    // Determine overall status
    // AI is ALWAYS available - show online status based on AI availability
    // Human staff availability is separate info
    const isOnline = true; // AI is always ready to help
    const humanStaffOnline = staffOnline > 0;

    return c.json({
      is_online: isOnline,
      isOnline, // Keep both for compatibility
      withinBusinessHours,
      staffOnline,
      humanStaffOnline,
      aiAvailable: true, // AI is always available
      businessHours: formattedHours,
      business_hours: businessHours, // Raw data for widget
      settings: {
        button_text: settings.button_text,
        welcome_message: settings.welcome_message,
        offline_message: settings.offline_message,
        primary_color: settings.primary_color,
        secondary_color: settings.secondary_color,
        show_business_hours: settings.show_business_hours
      },
      currentTime,
      timezone
    });
  } catch (error) {
    console.error('[Chat] Get status error:', error);
    return c.json({ 
      isOnline: false, 
      error: 'Failed to get chat status' 
    }, 500);
  }
}

