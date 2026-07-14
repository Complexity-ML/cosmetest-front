// ============================================================
// rdvService.test.ts - Tests pour le service RDV
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import rdvService from '../rdvService';

describe('RdvService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const apiModule = await import('../api');
    mockAxios = new MockAdapter(apiModule.default);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getPaginated', () => {
    it('devrait récupérer les RDV paginés', async () => {
      mockAxios.onGet('/rdvs/paginated').reply(200, { content: [{ id: 1 }], totalElements: 1 });
      const result = await rdvService.getPaginated();
      expect(result.content).toHaveLength(1);
    });

    it('devrait borner les paramètres envoyés', async () => {
      mockAxios.onGet('/rdvs/paginated', {
        params: { page: 0, size: 100, sort: 'date,desc' }
      }).reply(200, { content: [] });

      await expect(rdvService.getPaginated(-1, 10_000)).resolves.toBeDefined();
    });
  });

  describe('getById', () => {
    it('devrait récupérer un RDV par son ID technique sans fallback composite', async () => {
      mockAxios.onGet('/rdvs/9001').reply(200, { rdvPk: 9001, idEtude: 1, idRdv: 10 });
      const result = await rdvService.getById(9001);
      expect(result.rdvPk).toBe(9001);
    });
  });

  describe('create', () => {
    it('devrait créer un RDV', async () => {
      mockAxios.onPost('/rdvs').reply(201, { idRdv: 1 });
      const result = await rdvService.create({ date: '2024-01-01' });
      expect(result.idRdv).toBe(1);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un RDV par son ID technique', async () => {
      mockAxios.onPut('/rdvs/9001').reply(200, { rdvPk: 9001, idRdv: 10, updated: true });
      const result = await rdvService.update(9001, { date: '2024-01-02' });
      expect(result.updated).toBe(true);
    });
  });

  describe('delete', () => {
    it('devrait supprimer un RDV par son ID technique', async () => {
      mockAxios.onDelete('/rdvs/9001').reply(200, {});
      const result = await rdvService.delete(9001);
      expect(result).toBeDefined();
    });
  });

  describe('getByVolontaire', () => {
    it('devrait récupérer les RDV d\'un volontaire', async () => {
      mockAxios.onGet('/rdvs/by-volontaire/5').reply(200, [{ id: 1 }]);
      const result = await rdvService.getByVolontaire(5);
      expect(result).toHaveLength(1);
    });
  });
});
