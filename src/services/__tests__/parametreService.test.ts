// ============================================================
// parametreService.test.ts - Tests pour le service paramètres
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import parametreService from '../parametreService';

describe('ParametreService', () => {
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

  describe('getParametres', () => {
    it('devrait récupérer tous les paramètres', async () => {
      mockAxios.onGet('/identifiants').reply(200, [{ id: 1, login: 'user1' }]);
      const result = await parametreService.getParametres();
      expect(result).toHaveLength(1);
    });

    it('devrait retourner un tableau vide si pas de données', async () => {
      mockAxios.onGet('/identifiants').reply(200, null);
      const result = await parametreService.getParametres();
      expect(result).toEqual([]);
    });
  });

  describe('getParametresByRole', () => {
    it('devrait récupérer les paramètres par rôle', async () => {
      mockAxios.onGet('/identifiants/by-role/admin').reply(200, [{ id: 1 }]);
      const result = await parametreService.getParametresByRole('admin');
      expect(result).toHaveLength(1);
    });

    it('devrait rejeter si le rôle est vide', async () => {
      await expect(parametreService.getParametresByRole('')).rejects.toThrow();
    });
  });

  describe('createParametre', () => {
    it('devrait créer un paramètre', async () => {
      mockAxios.onPost('/identifiants').reply(201, { id: 1, login: 'newuser' });
      const result = await parametreService.createParametre({ login: 'newuser' });
      expect(result.id).toBe(1);
    });

    it('devrait rejeter si les données sont nulles', async () => {
      await expect(parametreService.createParametre(null)).rejects.toThrow();
    });
  });

  describe('getParametreByLogin', () => {
    it('devrait récupérer un paramètre par login', async () => {
      mockAxios.onGet('/identifiants/by-login/user1').reply(200, { login: 'user1' });
      const result = await parametreService.getParametreByLogin('user1');
      expect(result.login).toBe('user1');
    });
  });

  describe('updateParametres', () => {
    it('devrait mettre à jour un paramètre', async () => {
      mockAxios.onPut('/identifiants/1').reply(200, { id: 1, updated: true });
      const result = await parametreService.updateParametres(1, { name: 'updated' });
      expect(result.updated).toBe(true);
    });
  });

  describe('getParametreById', () => {
    it('devrait récupérer un paramètre par ID', async () => {
      mockAxios.onGet('/identifiants/1').reply(200, { id: 1 });
      const result = await parametreService.getParametreById(1);
      expect(result.id).toBe(1);
    });
  });
});
