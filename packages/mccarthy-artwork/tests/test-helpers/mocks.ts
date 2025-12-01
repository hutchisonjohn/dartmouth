/**
 * Mock implementations for Cloudflare Workers bindings
 * Used in comprehensive test suite
 */

/**
 * Mock KV Namespace
 * Implements the KVNamespace interface for testing
 */
export class MockKVNamespace implements KVNamespace {
  private store: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async put(key: string, value: string, options?: any): Promise<void> {
    this.store.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(options?: any): Promise<any> {
    return {
      keys: Array.from(this.store.keys()).map(name => ({ name })),
      list_complete: true,
      cursor: ''
    };
  }

  async getWithMetadata(key: string): Promise<any> {
    const value = this.store.get(key);
    return {
      value: value || null,
      metadata: null
    };
  }

  // Clear the store (useful for test cleanup)
  clear(): void {
    this.store.clear();
  }
}

/**
 * Mock D1 Database
 * Implements the D1Database interface for testing
 */
export class MockD1Database implements D1Database {
  private data: Map<string, any[]> = new Map();

  prepare(query: string): D1PreparedStatement {
    return new MockD1PreparedStatement(query, this.data);
  }

  dump(): Promise<ArrayBuffer> {
    throw new Error('dump() not implemented in mock');
  }

  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    throw new Error('batch() not implemented in mock');
  }

  exec(query: string): Promise<D1ExecResult> {
    throw new Error('exec() not implemented in mock');
  }
}

/**
 * Mock D1 Prepared Statement
 */
class MockD1PreparedStatement implements D1PreparedStatement {
  private bindings: any[] = [];

  constructor(
    private query: string,
    private data: Map<string, any[]>
  ) {}

  bind(...values: any[]): D1PreparedStatement {
    this.bindings = values;
    return this;
  }

  async first<T = unknown>(colName?: string): Promise<T | null> {
    // Simple mock - just return null for now
    return null;
  }

  async run<T = unknown>(): Promise<D1Result<T>> {
    // Simple mock - just return success
    return {
      success: true,
      meta: {},
      results: []
    } as D1Result<T>;
  }

  async all<T = unknown>(): Promise<D1Result<T>> {
    // Simple mock - return empty results
    return {
      success: true,
      meta: {},
      results: []
    } as D1Result<T>;
  }

  async raw<T = unknown>(): Promise<T[]> {
    return [];
  }
}

/**
 * Mock Workers AI
 */
export class MockWorkersAI {
  async run(model: string, inputs: any): Promise<any> {
    // Mock embedding generation
    if (model.includes('embed')) {
      return {
        data: [[0.1, 0.2, 0.3, 0.4, 0.5]] // Mock embedding vector
      };
    }
    return {};
  }
}

/**
 * Create a complete mock environment for testing
 */
export function createMockEnv() {
  const appConfig = new MockKVNamespace();
  const cache = new MockKVNamespace();
  const db = new MockD1Database();
  const workersAI = new MockWorkersAI();

  return {
    APP_CONFIG: appConfig,
    CACHE: cache,
    DB: db,
    WORKERS_AI: workersAI,
    ENVIRONMENT: 'test',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || ''
  };
}

