/**
 * Tenant Settings Controller
 * 
 * Manages Dartmouth OS tenant-level settings including:
 * - Business information
 * - Regional settings (timezone, language, measurement, currency)
 * - Date/time formats
 */

import { Context } from 'hono';
import type { Env } from '../types/shared';
import type { D1Database } from '@cloudflare/workers-types';

// Supported languages with their spelling conventions
export const SUPPORTED_LANGUAGES = {
  'en-AU': {
    name: 'Australian English',
    spellings: ['colour', 'metre', 'organisation', 'favour', 'centre', 'analyse'],
    greetings: ["G'day", 'Cheers', 'No worries', 'Mate']
  },
  'en-GB': {
    name: 'British English',
    spellings: ['colour', 'metre', 'organisation', 'favour', 'centre', 'analyse'],
    greetings: ['Hello', 'Cheers', 'Regards']
  },
  'en-US': {
    name: 'American English',
    spellings: ['color', 'meter', 'organization', 'favor', 'center', 'analyze'],
    greetings: ['Hi', 'Thanks', 'Best regards']
  },
  'en-CA': {
    name: 'Canadian English',
    spellings: ['colour', 'metre', 'organization', 'favour', 'centre', 'analyze'],
    greetings: ['Hello', 'Thanks', 'Cheers']
  }
};

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: 'AUD', symbol: '$', name: 'Australian Dollar' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar' },
  { code: 'SGD', symbol: '$', name: 'Singapore Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
];

// Common timezones
export const COMMON_TIMEZONES = [
  'Australia/Brisbane',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Australia/Perth',
  'Australia/Adelaide',
  'Pacific/Auckland',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Dubai'
];

export interface TenantSettings {
  tenant_id: string;
  business_name: string;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_website: string | null;
  timezone: string;
  language: string;
  measurement_system: string;
  currency: string;
  currency_symbol: string;
  date_format: string;
  time_format: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get tenant settings
 */
export async function getTenantSettings(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = 'test-tenant-dtf'; // TODO: Get from auth context
    
    const settings = await c.env.DB.prepare(`
      SELECT * FROM tenant_settings WHERE tenant_id = ?
    `).bind(tenantId).first<TenantSettings>();
    
    if (!settings) {
      // Return defaults if no settings exist
      return c.json({
        tenant_id: tenantId,
        business_name: '',
        business_email: '',
        business_phone: '',
        business_address: '',
        business_website: '',
        timezone: 'Australia/Brisbane',
        language: 'en-AU',
        measurement_system: 'metric',
        currency: 'AUD',
        currency_symbol: '$',
        date_format: 'DD/MM/YYYY',
        time_format: '12h'
      });
    }
    
    return c.json(settings);
  } catch (error) {
    console.error('[TenantSettings] Error getting settings:', error);
    return c.json({ error: 'Failed to get tenant settings' }, 500);
  }
}

/**
 * Update tenant settings
 */
export async function updateTenantSettings(c: Context<{ Bindings: Env }>) {
  try {
    const tenantId = 'test-tenant-dtf'; // TODO: Get from auth context
    const body = await c.req.json();
    
    const {
      business_name,
      business_email,
      business_phone,
      business_address,
      business_website,
      timezone,
      language,
      measurement_system,
      currency,
      currency_symbol,
      date_format,
      time_format
    } = body;
    
    // Validate required fields
    if (!business_name) {
      return c.json({ error: 'Business name is required' }, 400);
    }
    
    // Validate language
    if (language && !SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]) {
      return c.json({ error: 'Invalid language code' }, 400);
    }
    
    // Validate measurement system
    if (measurement_system && !['metric', 'imperial'].includes(measurement_system)) {
      return c.json({ error: 'Invalid measurement system' }, 400);
    }
    
    // Validate date format
    if (date_format && !['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'].includes(date_format)) {
      return c.json({ error: 'Invalid date format' }, 400);
    }
    
    // Validate time format
    if (time_format && !['12h', '24h'].includes(time_format)) {
      return c.json({ error: 'Invalid time format' }, 400);
    }
    
    // Upsert settings
    await c.env.DB.prepare(`
      INSERT INTO tenant_settings (
        tenant_id, business_name, business_email, business_phone, business_address, business_website,
        timezone, language, measurement_system, currency, currency_symbol, date_format, time_format
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(tenant_id) DO UPDATE SET
        business_name = excluded.business_name,
        business_email = excluded.business_email,
        business_phone = excluded.business_phone,
        business_address = excluded.business_address,
        business_website = excluded.business_website,
        timezone = excluded.timezone,
        language = excluded.language,
        measurement_system = excluded.measurement_system,
        currency = excluded.currency,
        currency_symbol = excluded.currency_symbol,
        date_format = excluded.date_format,
        time_format = excluded.time_format,
        updated_at = datetime('now')
    `).bind(
      tenantId,
      business_name,
      business_email || null,
      business_phone || null,
      business_address || null,
      business_website || null,
      timezone || 'Australia/Brisbane',
      language || 'en-AU',
      measurement_system || 'metric',
      currency || 'AUD',
      currency_symbol || '$',
      date_format || 'DD/MM/YYYY',
      time_format || '12h'
    ).run();
    
    console.log('[TenantSettings] Settings updated for tenant:', tenantId);
    
    return c.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('[TenantSettings] Error updating settings:', error);
    return c.json({ error: 'Failed to update tenant settings' }, 500);
  }
}

/**
 * Get available options for dropdowns
 */
export async function getTenantSettingsOptions(c: Context<{ Bindings: Env }>) {
  return c.json({
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
      code,
      name: info.name
    })),
    currencies: SUPPORTED_CURRENCIES,
    timezones: COMMON_TIMEZONES,
    measurementSystems: [
      { value: 'metric', label: 'Metric (cm, kg, km)' },
      { value: 'imperial', label: 'Imperial (in, lb, mi)' }
    ],
    dateFormats: [
      { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (04/12/2025)' },
      { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/04/2025)' },
      { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-04)' }
    ],
    timeFormats: [
      { value: '12h', label: '12-hour (2:30 PM)' },
      { value: '24h', label: '24-hour (14:30)' }
    ]
  });
}

/**
 * Get effective settings for an agent (tenant defaults + agent overrides)
 */
export async function getEffectiveAgentSettings(
  db: D1Database,
  tenantId: string,
  agentId: string
): Promise<TenantSettings> {
  // Get tenant defaults
  const tenantSettings = await db.prepare(`
    SELECT * FROM tenant_settings WHERE tenant_id = ?
  `).bind(tenantId).first<TenantSettings>();
  
  // Get agent overrides
  const agentOverrides = await db.prepare(`
    SELECT timezone, language, measurement_system, currency, currency_symbol, date_format, time_format
    FROM agents WHERE agent_id = ?
  `).bind(agentId).first<Partial<TenantSettings>>();
  
  // Merge: agent overrides take precedence if not null
  const defaults: TenantSettings = {
    tenant_id: tenantId,
    business_name: tenantSettings?.business_name || 'Your Business',
    business_email: tenantSettings?.business_email || null,
    business_phone: tenantSettings?.business_phone || null,
    business_address: tenantSettings?.business_address || null,
    business_website: tenantSettings?.business_website || null,
    timezone: tenantSettings?.timezone || 'Australia/Brisbane',
    language: tenantSettings?.language || 'en-AU',
    measurement_system: tenantSettings?.measurement_system || 'metric',
    currency: tenantSettings?.currency || 'AUD',
    currency_symbol: tenantSettings?.currency_symbol || '$',
    date_format: tenantSettings?.date_format || 'DD/MM/YYYY',
    time_format: tenantSettings?.time_format || '12h',
    created_at: tenantSettings?.created_at || new Date().toISOString(),
    updated_at: tenantSettings?.updated_at || new Date().toISOString()
  };
  
  // Apply agent overrides
  if (agentOverrides) {
    if (agentOverrides.timezone) defaults.timezone = agentOverrides.timezone;
    if (agentOverrides.language) defaults.language = agentOverrides.language;
    if (agentOverrides.measurement_system) defaults.measurement_system = agentOverrides.measurement_system;
    if (agentOverrides.currency) defaults.currency = agentOverrides.currency;
    if (agentOverrides.currency_symbol) defaults.currency_symbol = agentOverrides.currency_symbol;
    if (agentOverrides.date_format) defaults.date_format = agentOverrides.date_format;
    if (agentOverrides.time_format) defaults.time_format = agentOverrides.time_format;
  }
  
  return defaults;
}

/**
 * Build regional context string for AI prompts
 */
export function buildRegionalContext(settings: TenantSettings): string {
  const langInfo = SUPPORTED_LANGUAGES[settings.language as keyof typeof SUPPORTED_LANGUAGES] || SUPPORTED_LANGUAGES['en-AU'];
  
  const measurementExamples = settings.measurement_system === 'metric'
    ? 'cm, kg, km, °C'
    : 'in, lb, mi, °F';
  
  const dateExample = formatDateExample(settings.date_format);
  const timeExample = settings.time_format === '12h' ? '2:30 PM' : '14:30';
  
  return `# Regional Settings
- **Timezone:** ${settings.timezone}
- **Language:** ${langInfo.name}
  • Use spellings: ${langInfo.spellings.slice(0, 4).join(', ')}
  • Greetings: ${langInfo.greetings.join(', ')}
- **Measurement:** ${settings.measurement_system === 'metric' ? 'Metric' : 'Imperial'} (${measurementExamples})
- **Currency:** ${settings.currency} (${settings.currency_symbol})
- **Date Format:** ${settings.date_format} (e.g., ${dateExample})
- **Time Format:** ${settings.time_format === '12h' ? '12-hour' : '24-hour'} (e.g., ${timeExample})
- **Business:** ${settings.business_name}`;
}

function formatDateExample(format: string): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY': return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY': return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
    default: return `${day}/${month}/${year}`;
  }
}

