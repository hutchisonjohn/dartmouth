/**
 * Database Service
 * Handle D1 database operations
 */

import type { ProcessingJob } from '../types';

export async function createJob(
  db: D1Database,
  job: Partial<ProcessingJob>
): Promise<void> {
  await db.prepare(`
    INSERT INTO jobs (
      id, status, original_url, options, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    job.id,
    job.status,
    job.originalUrl,
    JSON.stringify(job.options),
    job.createdAt,
    job.updatedAt
  ).run();
}

export async function getJob(
  db: D1Database,
  jobId: string
): Promise<ProcessingJob | null> {
  const result = await db.prepare(`
    SELECT * FROM jobs WHERE id = ?
  `).bind(jobId).first();

  if (!result) {
    return null;
  }

  return {
    id: result.id as string,
    status: result.status as ProcessingJob['status'],
    originalUrl: result.original_url as string,
    processedUrl: result.processed_url as string | undefined,
    svgUrl: result.svg_url as string | undefined,
    options: JSON.parse(result.options as string),
    metrics: result.metrics ? JSON.parse(result.metrics as string) : undefined,
    error: result.error as string | undefined,
    createdAt: result.created_at as string,
    updatedAt: result.updated_at as string
  };
}

export async function updateJob(
  db: D1Database,
  jobId: string,
  updates: Partial<ProcessingJob>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (updates.processedUrl) {
    fields.push('processed_url = ?');
    values.push(updates.processedUrl);
  }

  if (updates.svgUrl) {
    fields.push('svg_url = ?');
    values.push(updates.svgUrl);
  }

  if (updates.options) {
    fields.push('options = ?');
    values.push(JSON.stringify(updates.options));
  }

  if (updates.metrics) {
    fields.push('metrics = ?');
    values.push(JSON.stringify(updates.metrics));
  }

  if (updates.error) {
    fields.push('error = ?');
    values.push(updates.error);
  }

  if (updates.updatedAt) {
    fields.push('updated_at = ?');
    values.push(updates.updatedAt);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(jobId);

  await db.prepare(`
    UPDATE jobs SET ${fields.join(', ')} WHERE id = ?
  `).bind(...values).run();
}

export async function listJobs(
  db: D1Database,
  limit: number = 10
): Promise<ProcessingJob[]> {
  const results = await db.prepare(`
    SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?
  `).bind(limit).all();

  return results.results.map((row: any) => ({
    id: row.id,
    status: row.status,
    originalUrl: row.original_url,
    processedUrl: row.processed_url,
    svgUrl: row.svg_url,
    options: JSON.parse(row.options),
    metrics: row.metrics ? JSON.parse(row.metrics) : undefined,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

