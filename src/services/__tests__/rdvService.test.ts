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

    it('préserve la lecture composite des écrans historiques', async () => {
      mockAxios.onGet('/rdvs/2189/7').reply(200, {
        rdvPk: 99001,
        idEtude: 2189,
        idRdv: 7,
        idVolontaire: null,
      });

      const result = await rdvService.getById(2189, 7);

      expect(result).toMatchObject({ idEtude: 2189, idRdv: 7, idVolontaire: null });
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

    it('préserve le contrat composite utilisé par les écrans d’affectation', async () => {
      const payload = { idVolontaire: 77, idGroupe: 4, etat: 'PLANIFIE' };
      mockAxios.onPut('/rdvs/12/3', payload).reply(200, {
        success: true,
        rdv: { idEtude: 12, idRdv: 3, idVolontaire: 77 }
      });

      const result = await rdvService.update(12, 3, payload);

      expect(result.rdv.idVolontaire).toBe(77);
    });
  });

  describe('delete', () => {
    it('devrait supprimer un RDV par son ID technique', async () => {
      mockAxios.onDelete('/rdvs/9001').reply(200, {});
      const result = await rdvService.delete(9001);
      expect(result).toBeDefined();
    });

    it('préserve la suppression composite utilisée par les écrans historiques', async () => {
      mockAxios.onDelete('/rdvs/12/3').reply(200, {});
      await expect(rdvService.delete(12, 3)).resolves.toBeDefined();
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
