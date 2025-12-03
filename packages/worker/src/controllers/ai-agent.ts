import type { Context } from 'hono';
import type { Env } from '../types/shared';

// ============================================================================
// RAG KNOWLEDGE DOCUMENTS
// ============================================================================

interface KnowledgeDocument {
  id: string;
  filename: string;
  title: string;
  category: string;
  content: string;
  content_preview: string;
  word_count: number;
  uploaded_at: string;
  uploaded_by: string;
  status: 'active' | 'processing' | 'error';
}

/**
 * List all RAG knowledge documents
 * GET /api/ai-agent/knowledge
 */
export async function listKnowledgeDocuments(c: Context<{ Bindings: Env }>) {
  try {
    const { results } = await c.env.DB.prepare(`
      SELECT id, filename, title, category, 
             substr(content, 1, 200) as content_preview,
             word_count, uploaded_at, uploaded_by, status
      FROM ai_knowledge_documents
      WHERE deleted_at IS NULL
      ORDER BY uploaded_at DESC
    `).all();

    return c.json({
      documents: results || [],
      total: results?.length || 0
    });
  } catch (error: any) {
    console.error('[AIAgent] List knowledge documents error:', error);
    return c.json({ error: 'Failed to list documents', documents: [], total: 0 });
  }
}

/**
 * Upload a new RAG knowledge document
 * POST /api/ai-agent/knowledge/upload
 */
export async function uploadKnowledgeDocument(c: Context<{ Bindings: Env }>) {
  try {
    const user = c.get('user') as { id: string; email: string };
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'general';

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Read file content
    const content = await file.text();
    const filename = file.name;
    
    // Extract title from markdown (first # heading) or use filename
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : filename.replace(/\.[^/.]+$/, '');
    
    // Calculate word count
    const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      INSERT INTO ai_knowledge_documents (
        id, filename, title, category, content, word_count, 
        uploaded_at, uploaded_by, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      id, filename, title, category, content, wordCount,
      now, user.id
    ).run();

    console.log(`[AIAgent] Knowledge document uploaded: ${filename} (${wordCount} words)`);

    return c.json({
      message: 'Document uploaded successfully',
      document: {
        id,
        filename,
        title,
        category,
        word_count: wordCount,
        status: 'active'
      }
    });
  } catch (error: any) {
    console.error('[AIAgent] Upload document error:', error);
    return c.json({ error: 'Failed to upload document: ' + error.message }, 500);
  }
}

/**
 * Delete a RAG knowledge document
 * DELETE /api/ai-agent/knowledge/:id
 */
export async function deleteKnowledgeDocument(c: Context<{ Bindings: Env }>) {
  try {
    const id = c.req.param('id');
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
      UPDATE ai_knowledge_documents 
      SET deleted_at = ?, status = 'deleted'
      WHERE id = ?
    `).bind(now, id).run();

    console.log(`[AIAgent] Knowledge document deleted: ${id}`);

    return c.json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    console.error('[AIAgent] Delete document error:', error);
    return c.json({ error: 'Failed to delete document: ' + error.message }, 500);
  }
}

/**
 * Reprocess all RAG knowledge documents (for embedding updates)
 * POST /api/ai-agent/knowledge/reprocess
 */
export async function reprocessKnowledgeDocuments(c: Context<{ Bindings: Env }>) {
  try {
    // Mark all documents as processing
    await c.env.DB.prepare(`
      UPDATE ai_knowledge_documents 
      SET status = 'processing'
      WHERE deleted_at IS NULL
    `).run();

    // TODO: Trigger actual reprocessing (embedding generation, vector storage)
    // For now, just mark them as active again
    await c.env.DB.prepare(`
      UPDATE ai_knowledge_documents 
      SET status = 'active'
      WHERE deleted_at IS NULL
    `).run();

    console.log('[AIAgent] Knowledge documents reprocessed');

    return c.json({ message: 'Documents reprocessed successfully' });
  } catch (error: any) {
    console.error('[AIAgent] Reprocess documents error:', error);
    return c.json({ error: 'Failed to reprocess documents: ' + error.message }, 500);
  }
}

// ============================================================================
// SYSTEM MESSAGE CONFIGURATION
// ============================================================================

interface SystemMessageConfig {
  role: string;
  personality: string;
  responsibilities: string;
  dos: string;
  donts: string;
  tone: string;
  custom_instructions: string;
}

const DEFAULT_SYSTEM_MESSAGE: SystemMessageConfig = {
  role: `You are McCarthy AI, a friendly and professional customer service assistant for Amazing Transfers, an Australian company specializing in DTF (Direct to Film) and UV DTF transfers for custom printing.`,
  personality: `- Warm, helpful, and professional
- Use Australian English (colour, metre, etc.)
- Friendly but not overly casual
- Patient and understanding
- Knowledgeable about DTF printing`,
  responsibilities: `- Answer questions about products, ordering, and policies
- Help customers with order inquiries
- Provide application instructions for DTF and UV DTF transfers
- Explain shipping, returns, and refund policies
- Assist with artwork requirements and file formats
- Escalate complex issues to human staff when needed`,
  dos: `- Always be polite and respectful
- Provide accurate information from the knowledge base
- Acknowledge customer frustrations with empathy
- Offer to escalate to human staff when you can't help
- Use the customer's name when known
- Confirm understanding before providing solutions`,
  donts: `- Never make up information or guess at policies
- Don't provide specific pricing (direct to website)
- Don't promise things you can't guarantee
- Never argue with customers
- Don't share internal business information
- Don't use American spelling (use colour not color)`,
  tone: `Professional yet friendly. Think of a knowledgeable colleague who genuinely wants to help. Not robotic, but not overly casual either. Match the customer's energy level.`,
  custom_instructions: ``,
};

/**
 * Get AI Agent system message configuration
 * GET /api/ai-agent/system-message
 */
export async function getSystemMessageConfig(c: Context<{ Bindings: Env }>) {
  try {
    const result = await c.env.DB.prepare(`
      SELECT * FROM ai_system_message_config WHERE id = 'default'
    `).first();

    if (result) {
      return c.json({
        config: {
          role: result.role,
          personality: result.personality,
          responsibilities: result.responsibilities,
          dos: result.dos,
          donts: result.donts,
          tone: result.tone,
          custom_instructions: result.custom_instructions,
        }
      });
    }

    // Return default if no config exists
    return c.json({ config: DEFAULT_SYSTEM_MESSAGE });
  } catch (error: any) {
    console.error('[AIAgent] Get system message config error:', error);
    // Return default on error
    return c.json({ config: DEFAULT_SYSTEM_MESSAGE });
  }
}

/**
 * Update AI Agent system message configuration
 * PUT /api/ai-agent/system-message
 */
export async function updateSystemMessageConfig(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json() as Partial<SystemMessageConfig>;
    const now = new Date().toISOString();

    // Check if config exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM ai_system_message_config WHERE id = 'default'
    `).first();

    if (existing) {
      // Update existing
      await c.env.DB.prepare(`
        UPDATE ai_system_message_config SET
          role = COALESCE(?, role),
          personality = COALESCE(?, personality),
          responsibilities = COALESCE(?, responsibilities),
          dos = COALESCE(?, dos),
          donts = COALESCE(?, donts),
          tone = COALESCE(?, tone),
          custom_instructions = COALESCE(?, custom_instructions),
          updated_at = ?
        WHERE id = 'default'
      `).bind(
        body.role, body.personality, body.responsibilities,
        body.dos, body.donts, body.tone, body.custom_instructions,
        now
      ).run();
    } else {
      // Insert new
      await c.env.DB.prepare(`
        INSERT INTO ai_system_message_config (
          id, role, personality, responsibilities, dos, donts, tone, 
          custom_instructions, created_at, updated_at
        ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        body.role || DEFAULT_SYSTEM_MESSAGE.role,
        body.personality || DEFAULT_SYSTEM_MESSAGE.personality,
        body.responsibilities || DEFAULT_SYSTEM_MESSAGE.responsibilities,
        body.dos || DEFAULT_SYSTEM_MESSAGE.dos,
        body.donts || DEFAULT_SYSTEM_MESSAGE.donts,
        body.tone || DEFAULT_SYSTEM_MESSAGE.tone,
        body.custom_instructions || '',
        now, now
      ).run();
    }

    console.log('[AIAgent] System message config updated');

    return c.json({ message: 'Configuration saved successfully' });
  } catch (error: any) {
    console.error('[AIAgent] Update system message config error:', error);
    return c.json({ error: 'Failed to save configuration: ' + error.message }, 500);
  }
}

/**
 * Reset AI Agent system message to default
 * POST /api/ai-agent/system-message/reset
 */
export async function resetSystemMessageConfig(c: Context<{ Bindings: Env }>) {
  try {
    const now = new Date().toISOString();

    // Check if config exists
    const existing = await c.env.DB.prepare(`
      SELECT id FROM ai_system_message_config WHERE id = 'default'
    `).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE ai_system_message_config SET
          role = ?,
          personality = ?,
          responsibilities = ?,
          dos = ?,
          donts = ?,
          tone = ?,
          custom_instructions = '',
          updated_at = ?
        WHERE id = 'default'
      `).bind(
        DEFAULT_SYSTEM_MESSAGE.role,
        DEFAULT_SYSTEM_MESSAGE.personality,
        DEFAULT_SYSTEM_MESSAGE.responsibilities,
        DEFAULT_SYSTEM_MESSAGE.dos,
        DEFAULT_SYSTEM_MESSAGE.donts,
        DEFAULT_SYSTEM_MESSAGE.tone,
        now
      ).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO ai_system_message_config (
          id, role, personality, responsibilities, dos, donts, tone, 
          custom_instructions, created_at, updated_at
        ) VALUES ('default', ?, ?, ?, ?, ?, ?, '', ?, ?)
      `).bind(
        DEFAULT_SYSTEM_MESSAGE.role,
        DEFAULT_SYSTEM_MESSAGE.personality,
        DEFAULT_SYSTEM_MESSAGE.responsibilities,
        DEFAULT_SYSTEM_MESSAGE.dos,
        DEFAULT_SYSTEM_MESSAGE.donts,
        DEFAULT_SYSTEM_MESSAGE.tone,
        now, now
      ).run();
    }

    console.log('[AIAgent] System message config reset to default');

    return c.json({ 
      message: 'Configuration reset to default',
      config: DEFAULT_SYSTEM_MESSAGE 
    });
  } catch (error: any) {
    console.error('[AIAgent] Reset system message config error:', error);
    return c.json({ error: 'Failed to reset configuration: ' + error.message }, 500);
  }
}

// ============================================================================
// AGENT REGIONAL OVERRIDES
// ============================================================================

interface AgentRegionalOverrides {
  agent_id: string;
  timezone: string | null;
  language: string | null;
  measurement_system: string | null;
  currency: string | null;
  currency_symbol: string | null;
  date_format: string | null;
  time_format: string | null;
}

/**
 * Get agent regional overrides
 * GET /api/ai-agent/regional-overrides
 */
export async function getRegionalOverrides(c: Context<{ Bindings: Env }>) {
  try {
    const agentId = 'ai-agent-001'; // TODO: Get from query param or auth context
    
    const result = await c.env.DB.prepare(`
      SELECT agent_id, timezone, language, measurement_system, 
             currency, currency_symbol, date_format, time_format
      FROM agents 
      WHERE agent_id = ?
    `).bind(agentId).first();

    if (result) {
      return c.json(result);
    }

    // Return empty overrides if agent doesn't exist
    return c.json({
      agent_id: agentId,
      timezone: null,
      language: null,
      measurement_system: null,
      currency: null,
      currency_symbol: null,
      date_format: null,
      time_format: null
    });
  } catch (error: any) {
    console.error('[AIAgent] Get regional overrides error:', error);
    return c.json({ error: 'Failed to get regional overrides' }, 500);
  }
}

/**
 * Update agent regional overrides
 * PUT /api/ai-agent/regional-overrides
 */
export async function updateRegionalOverrides(c: Context<{ Bindings: Env }>) {
  try {
    const body = await c.req.json() as AgentRegionalOverrides;
    const agentId = body.agent_id || 'ai-agent-001';
    
    // Update agent overrides
    await c.env.DB.prepare(`
      UPDATE agents SET
        timezone = ?,
        language = ?,
        measurement_system = ?,
        currency = ?,
        currency_symbol = ?,
        date_format = ?,
        time_format = ?,
        updated_at = datetime('now')
      WHERE agent_id = ?
    `).bind(
      body.timezone || null,
      body.language || null,
      body.measurement_system || null,
      body.currency || null,
      body.currency_symbol || null,
      body.date_format || null,
      body.time_format || null,
      agentId
    ).run();

    console.log(`[AIAgent] Updated regional overrides for agent: ${agentId}`);
    
    return c.json({ success: true, message: 'Regional overrides updated' });
  } catch (error: any) {
    console.error('[AIAgent] Update regional overrides error:', error);
    return c.json({ error: 'Failed to update regional overrides: ' + error.message }, 500);
  }
}

/**
 * Get the full compiled system prompt for the AI Agent
 * This combines the system message config with RAG knowledge context
 * Used internally by the AI Agent
 */
export async function getCompiledSystemPrompt(env: Env): Promise<string> {
  try {
    // Get system message config
    const configResult = await env.DB.prepare(`
      SELECT * FROM ai_system_message_config WHERE id = 'default'
    `).first();

    const config = configResult ? {
      role: configResult.role as string,
      personality: configResult.personality as string,
      responsibilities: configResult.responsibilities as string,
      dos: configResult.dos as string,
      donts: configResult.donts as string,
      tone: configResult.tone as string,
      custom_instructions: configResult.custom_instructions as string,
    } : DEFAULT_SYSTEM_MESSAGE;

    // Build the system prompt
    let systemPrompt = `# Role
${config.role}

# Personality
${config.personality}

# Responsibilities
${config.responsibilities}

# Do's
${config.dos}

# Don'ts
${config.donts}

# Tone
${config.tone}`;

    if (config.custom_instructions) {
      systemPrompt += `

# Custom Instructions
${config.custom_instructions}`;
    }

    return systemPrompt;
  } catch (error) {
    console.error('[AIAgent] Error getting compiled system prompt:', error);
    // Return a basic fallback
    return `You are McCarthy AI, a helpful customer service assistant. Be professional, friendly, and helpful.`;
  }
}

