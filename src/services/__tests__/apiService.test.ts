// ============================================================
// apiService.test.ts - Tests pour apiService (alternative à api.ts)
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait exporter une instance axios', async () => {
    const apiModule = await import('../apiService');
    expect(apiModule.default).toBeDefined();
  });

  it('devrait réexporter le client API canonique au lieu de dupliquer les intercepteurs', async () => {
    const [legacyModule, canonicalModule] = await Promise.all([
      import('../apiService'),
      import('../api')
    ]);

    expect(legacyModule.default).toBe(canonicalModule.default);
  });

  it('devrait conserver une baseURL normalisée terminant par /api', async () => {
    const apiModule = await import('../apiService');
    expect(apiModule.default.defaults.baseURL).toMatch(/\/api$/);
    expect(apiModule.default.defaults.baseURL).not.toContain('/api/api');
  });

  it('devrait avoir des intercepteurs configurés', async () => {
    const apiModule = await import('../apiService');
    expect(apiModule.default.interceptors.request).toBeDefined();
    expect(apiModule.default.interceptors.response).toBeDefined();
  });
});
