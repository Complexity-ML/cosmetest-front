// ============================================================
// volontaireService.test.ts - Tests pour le service volontaire
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import volontaireService from '../volontaireService';

describe('VolontaireService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const apiModule = await import('../api');
    mockAxios = new MockAdapter(apiModule.default);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('devrait récupérer tous les volontaires', async () => {
      mockAxios.onGet('/volontaires').reply(200, [{ idVol: 1, nomVol: 'Test' }]);
      const result = await volontaireService.getAll();
      expect(result).toBeDefined();
    });
  });

  describe('getById', () => {
    it('devrait récupérer un volontaire par ID', async () => {
      mockAxios.onGet('/volontaires/1').reply(200, { idVol: 1, nomVol: 'Test' });
      const result = await volontaireService.getById(1);
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('devrait créer un volontaire', async () => {
      mockAxios.onPost('/volontaires/details').reply(201, { idVol: 1, nomVol: 'Nouveau' });
      const result = await volontaireService.create({ nomVol: 'Nouveau' });
      expect(result).toBeDefined();
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un volontaire', async () => {
      mockAxios.onPut('/volontaires/1').reply(200, { idVol: 1, nomVol: 'Modifié' });
      const result = await volontaireService.update(1, { nomVol: 'Modifié' });
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('devrait supprimer un volontaire', async () => {
      mockAxios.onDelete('/volontaires/1').reply(204);
      await expect(volontaireService.delete(1)).resolves.not.toThrow();
    });
  });

  describe('search', () => {
    it('devrait rechercher des volontaires', async () => {
      mockAxios.onGet('/volontaires/search').reply(200, [{ idVol: 1 }]);
      const result = await volontaireService.search({ keyword: 'test' });
      expect(result).toBeDefined();
    });
  });

  describe('archive', () => {
    it('devrait archiver un volontaire', async () => {
      mockAxios.onPut('/volontaires/1/archive').reply(200, { success: true });
      const result = await volontaireService.archive(1);
      expect(result).toBeDefined();
    });
  });

  describe('unarchive', () => {
    it('devrait désarchiver un volontaire', async () => {
      mockAxios.onPut('/volontaires/1/unarchive').reply(200, { success: true });
      const result = await volontaireService.unarchive(1);
      expect(result).toBeDefined();
    });
  });
});
