// ============================================================
// PaiementService.test.ts - Tests pour le service paiements
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import paiementService from '../PaiementService';

describe('PaiementService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const apiModule = await import('../api');
    mockAxios = new MockAdapter(apiModule.default);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getAllPaiements', () => {
    it('devrait récupérer tous les paiements', async () => {
      mockAxios.onGet('/etude-volontaires/paiements').reply(200, [{ id: 1 }]);
      const result = await paiementService.getAllPaiements();
      expect(result).toHaveLength(1);
    });

    it('devrait filtrer par étude', async () => {
      mockAxios.onGet('/etude-volontaires/paiements').reply(200, []);
      await paiementService.getAllPaiements({ idEtude: 10 });
      expect(mockAxios.history.get[0].params.idEtude).toBe(10);
    });
  });

  describe('getPaiementsSummaryParEtude', () => {
    it('devrait récupérer le résumé des paiements', async () => {
      mockAxios.onGet('/paiements/etudes/summary').reply(200, [{ total: 1000 }]);
      const result = await paiementService.getPaiementsSummaryParEtude();
      expect(result).toHaveLength(1);
    });
  });

  describe('getPaiementsSummaryPourEtude', () => {
    it('devrait récupérer le résumé pour une étude', async () => {
      mockAxios.onGet('/paiements/etudes/10/summary').reply(200, { total: 500 });
      const result = await paiementService.getPaiementsSummaryPourEtude(10);
      expect(result.total).toBe(500);
    });
  });

  describe('getPaiementsByEtude', () => {
    it('devrait récupérer les paiements d\'une étude', async () => {
      mockAxios.onGet('/etude-volontaires/etude/10/paiements').reply(200, [{ id: 1 }]);
      const result = await paiementService.getPaiementsByEtude(10);
      expect(result).toHaveLength(1);
    });
  });

  describe('updateStatutPaiement', () => {
    it('devrait mettre à jour le statut de paiement', async () => {
      mockAxios.onPatch('/etude-volontaires/update-paiement').reply(200, { success: true });
      const result = await paiementService.updateStatutPaiement(10, 1, 1);
      expect(result.success).toBe(true);
    });
  });
});
