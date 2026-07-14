import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { AxiosInstance } from 'axios';
import {
  dashboardEndpoints,
  identifiantEndpoints,
  paiementEndpoints,
  panelEndpoint,
} from '../apiEndpoints';

let api: AxiosInstance;

beforeAll(async () => {
  vi.stubEnv('VITE_API_URL', '');
  vi.resetModules();
  api = (await import('../api')).default;
});

describe('résolution des URL API', () => {
  it.each(Object.values(dashboardEndpoints))(
    'résout le endpoint Dashboard %s sous une seule base /api',
    (endpoint) => {
      const resolvedUrl = api.getUri({ url: endpoint });

      expect(resolvedUrl).toMatch(/^\/api\/dashboard\//);
      expect(resolvedUrl).not.toContain('/api/api/');
    },
  );

  it('résout la suppression Panel sous une seule base /api', () => {
    const resolvedUrl = api.getUri({ url: panelEndpoint(42) });

    expect(resolvedUrl).toBe('/api/panels/42');
    expect(resolvedUrl).not.toContain('/api/api/');
  });

  it('conserve les contrats backend pour mot de passe et paiement groupé', () => {
    expect(api.getUri({ url: identifiantEndpoints.changePassword(7) }))
      .toBe('/api/identifiants/7/changer-mot-de-passe');
    expect(api.getUri({ url: paiementEndpoints.markAllPaid(9) }))
      .toBe('/api/paiements/etudes/9/mark-all-paid');
  });
});
