// ============================================================
// infoBancaireService.test.ts - Tests pour le service info bancaire
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import infoBancaireService from '../infoBancaireService';

describe('InfoBancaireService', () => {
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

  describe('getAll', () => {
    it('devrait récupérer toutes les infos bancaires', async () => {
      mockAxios.onGet('/infobancaires').reply(200, [{ id: 1 }]);
      const result = await infoBancaireService.getAll();
      expect(result).toBeDefined();
    });
  });

  describe('getByVolontaireId', () => {
    it('devrait récupérer les infos bancaires d\'un volontaire', async () => {
      mockAxios.onGet('/infobancaires/volontaire/1').reply(200, { iban: 'FR7630001007941234567890185', bic: 'AGRIFRPP' });
      const result = await infoBancaireService.getByVolontaireId(1);
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('devrait créer une info bancaire', async () => {
      mockAxios.onPost('/infobancaires').reply(201, { id: 1 });
      const result = await infoBancaireService.create({
        iban: 'FR7630001007941234567890185',
        bic: 'AGRIFRPP',
        idVol: 1
      });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une info bancaire', async () => {
      mockAxios.onPut('/infobancaires').reply(200, { id: 1, updated: true });
      const result = await infoBancaireService.update('AGRIFRPP', 'FR7630001007941234567890185', 1, {
        iban: 'FR7630001007941234567890185',
        bic: 'AGRIFRPP',
        idVol: 1
      });
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('devrait supprimer une info bancaire', async () => {
      mockAxios.onDelete('/infobancaires').reply(200);
      await expect(infoBancaireService.delete('AGRIFRPP', 'FR7630001007941234567890185', 1)).resolves.toBeDefined();
    });
  });
});
