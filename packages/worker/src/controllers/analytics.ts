/**
 * Analytics Controller
 * Provides analytics data for AI Agent performance and other metrics
 */

import { Context } from 'hono';
import type { Env } from '../types/shared';

/**
 * Get AI Agent statistics
 */
export async function getAIAgentStats(c: Context<{ Bindings: Env }>) {
  try {
    const timeRange = c.req.query('timeRange') || '7d';
    
    // Calculate date filter
    let dateFilter = '';
    const now = new Date();
    switch (timeRange) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      default:
        dateFilter = ''; // All time
    }

    // Get basic stats
    const statsQuery = dateFilter 
      ? `SELECT 
          COUNT(*) as total_drafts,
          AVG(CASE WHEN quality_score IS NOT NULL THEN quality_score ELSE NULL END) as avg_quality_score,
          SUM(CASE WHEN was_helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
          SUM(CASE WHEN quality_score IS NOT NULL THEN 1 ELSE 0 END) as feedback_count,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN status = 'edited' THEN 1 ELSE 0 END) as edited_count,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
          AVG(processing_time_ms) as avg_processing_time
        FROM ai_draft_responses
        WHERE created_at >= ?`
      : `SELECT 
          COUNT(*) as total_drafts,
          AVG(CASE WHEN quality_score IS NOT NULL THEN quality_score ELSE NULL END) as avg_quality_score,
          SUM(CASE WHEN was_helpful = 1 THEN 1 ELSE 0 END) as helpful_count,
          SUM(CASE WHEN quality_score IS NOT NULL THEN 1 ELSE 0 END) as feedback_count,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_count,
          SUM(CASE WHEN status = 'edited' THEN 1 ELSE 0 END) as edited_count,
          SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_count,
          AVG(processing_time_ms) as avg_processing_time
        FROM ai_draft_responses`;

    const statsResult = dateFilter
      ? await c.env.DB.prepare(statsQuery).bind(dateFilter).first()
      : await c.env.DB.prepare(statsQuery).first();

    const stats = statsResult || {};
    const totalDrafts = Number(stats.total_drafts) || 0;
    const feedbackCount = Number(stats.feedback_count) || 0;
    const approvedCount = Number(stats.approved_count) || 0;
    const editedCount = Number(stats.edited_count) || 0;
    const rejectedCount = Number(stats.rejected_count) || 0;
    const totalActioned = approvedCount + editedCount + rejectedCount;

    // Get quality distribution
    const qualityQuery = dateFilter
      ? `SELECT 
          quality_score as score,
          COUNT(*) as count
        FROM ai_draft_responses
        WHERE quality_score IS NOT NULL AND created_at >= ?
        GROUP BY quality_score
        ORDER BY quality_score DESC`
      : `SELECT 
          quality_score as score,
          COUNT(*) as count
        FROM ai_draft_responses
        WHERE quality_score IS NOT NULL
        GROUP BY quality_score
        ORDER BY quality_score DESC`;

    const qualityResults = dateFilter
      ? await c.env.DB.prepare(qualityQuery).bind(dateFilter).all()
      : await c.env.DB.prepare(qualityQuery).all();

    const qualityDistribution = (qualityResults.results || []).map((row: any) => ({
      score: row.score,
      count: row.count,
      percentage: feedbackCount > 0 ? (row.count / feedbackCount) * 100 : 0
    }));

    // Get intent performance
    const intentQuery = dateFilter
      ? `SELECT 
          intent,
          COUNT(*) as count,
          AVG(quality_score) as avg_quality,
          SUM(CASE WHEN was_helpful = 1 THEN 1 ELSE 0 END) * 100.0 / 
            NULLIF(SUM(CASE WHEN was_helpful IS NOT NULL THEN 1 ELSE 0 END), 0) as helpful_rate
        FROM ai_draft_responses
        WHERE created_at >= ?
        GROUP BY intent
        ORDER BY count DESC
        LIMIT 10`
      : `SELECT 
          intent,
          COUNT(*) as count,
          AVG(quality_score) as avg_quality,
          SUM(CASE WHEN was_helpful = 1 THEN 1 ELSE 0 END) * 100.0 / 
            NULLIF(SUM(CASE WHEN was_helpful IS NOT NULL THEN 1 ELSE 0 END), 0) as helpful_rate
        FROM ai_draft_responses
        GROUP BY intent
        ORDER BY count DESC
        LIMIT 10`;

    const intentResults = dateFilter
      ? await c.env.DB.prepare(intentQuery).bind(dateFilter).all()
      : await c.env.DB.prepare(intentQuery).all();

    const intentPerformance = (intentResults.results || []).map((row: any) => ({
      intent: row.intent || 'unknown',
      count: row.count,
      avgQuality: row.avg_quality || 0,
      helpfulRate: row.helpful_rate || 0,
      trend: 0 // Would need historical data to calculate
    }));

    // Get recent feedback
    const recentQuery = `SELECT 
        d.id,
        d.ticket_id,
        d.intent,
        d.quality_score,
        d.was_helpful,
        d.improvement_notes,
        d.created_at,
        t.ticket_number
      FROM ai_draft_responses d
      LEFT JOIN tickets t ON d.ticket_id = t.ticket_id
      WHERE d.quality_score IS NOT NULL
      ORDER BY d.feedback_submitted_at DESC
      LIMIT 10`;

    const recentResults = await c.env.DB.prepare(recentQuery).all();

    return c.json({
      data: {
        stats: {
          totalDrafts,
          avgQualityScore: Number(stats.avg_quality_score) || 0,
          helpfulRate: feedbackCount > 0 ? (Number(stats.helpful_count) / feedbackCount) * 100 : 0,
          approvalRate: totalActioned > 0 ? (approvedCount / totalActioned) * 100 : 0,
          editRate: totalActioned > 0 ? (editedCount / totalActioned) * 100 : 0,
          rejectRate: totalActioned > 0 ? (rejectedCount / totalActioned) * 100 : 0,
          avgProcessingTime: Number(stats.avg_processing_time) || 0,
          totalFeedback: feedbackCount
        },
        qualityDistribution,
        intentPerformance,
        recentFeedback: recentResults.results || []
      }
    });
  } catch (error) {
    console.error('[Analytics] Error getting AI agent stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

/**
 * Get learning examples (high-quality responses)
 */
export async function getLearningExamples(c: Context<{ Bindings: Env }>) {
  try {
    const limit = parseInt(c.req.query('limit') || '10');

    const { results } = await c.env.DB.prepare(`
      SELECT 
        id,
        intent,
        sentiment,
        customer_message,
        ai_response,
        quality_score,
        created_at
      FROM ai_learning_examples
      ORDER BY created_at DESC
      LIMIT ?
    `).bind(limit).all();

    return c.json({
      data: {
        examples: results || [],
        total: results?.length || 0
      }
    });
  } catch (error) {
    console.error('[Analytics] Error getting learning examples:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
}

