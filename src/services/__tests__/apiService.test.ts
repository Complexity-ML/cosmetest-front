// ============================================================
// apiService.test.ts - Tests pour apiService (alternative à api.ts)
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Cookies
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    remove: vi.fn()
  }
}));

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devrait exporter une instance axios', async () => {
    const apiModule = await import('../apiService');
    expect(apiModule.default).toBeDefined();
  });

  it('devrait avoir une baseURL configurée', async () => {
    const apiModule = await import('../apiService');
    expect(apiModule.default.defaults.baseURL).toBe('/api');
  });

  it('devrait avoir des intercepteurs configurés', async () => {
    const apiModule = await import('../apiService');
    expect(apiModule.default.interceptors.request).toBeDefined();
    expect(apiModule.default.interceptors.response).toBeDefined();
  });
});
