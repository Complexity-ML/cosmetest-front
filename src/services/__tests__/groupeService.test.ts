// ============================================================
// groupeService.test.ts - Tests pour le service groupes
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import groupeService from '../groupeService';

describe('GroupeService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const apiModule = await import('../api');
    const api = apiModule.default;
    mockAxios = new MockAdapter(api);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getAll', () => {
    it('devrait récupérer tous les groupes', async () => {
      const mockGroupes = [
        { idGroupe: 1, nom: 'Groupe 1' },
        { idGroupe: 2, nom: 'Groupe 2' }
      ];

      mockAxios.onGet('/groupes').reply(200, mockGroupes);

      const result = await groupeService.getAll();

      expect(result).toHaveLength(2);
    });

    it('devrait gérer les erreurs', async () => {
      mockAxios.onGet('/groupes').reply(500);

      await expect(groupeService.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('devrait récupérer un groupe par ID', async () => {
      const mockGroupe = { idGroupe: 1, nom: 'Groupe Test' };

      mockAxios.onGet('/groupes/1').reply(200, mockGroupe);

      const result = await groupeService.getById(1);

      expect(result.nom).toBe('Groupe Test');
    });

    it('devrait rejeter si l\'ID est invalide', async () => {
      await expect(groupeService.getById('undefined')).rejects.toThrow('ID de groupe non valide');
    });
  });

  describe('getGroupesByIdEtude', () => {
    it('devrait récupérer les groupes d\'une étude', async () => {
      const mockGroupes = [{ idGroupe: 1, idEtude: 10 }];

      mockAxios.onGet('/groupes/etude/10').reply(200, mockGroupes);

      const result = await groupeService.getGroupesByIdEtude(10);

      expect(result).toHaveLength(1);
    });
  });

  describe('getGroupesByEthnie', () => {
    it('devrait récupérer les groupes par ethnie', async () => {
      const mockGroupes = [{ idGroupe: 1, ethnie: 'Caucasien' }];

      mockAxios.onGet('/groupes/ethnie/Caucasien').reply(200, mockGroupes);

      const result = await groupeService.getGroupesByEthnie('Caucasien');

      expect(result).toHaveLength(1);
    });
  });

  describe('getPaginated', () => {
    it('devrait simuler la pagination si backend retourne un tableau', async () => {
      const mockGroupes = Array.from({ length: 25 }, (_, i) => ({
        idGroupe: i + 1,
        nom: `Groupe ${i + 1}`
      }));

      mockAxios.onGet('/groupes').reply(200, mockGroupes);

      const result = await groupeService.getPaginated(0, 10, 'idGroupe', 'ASC');

      expect(result.content).toHaveLength(10);
      expect(result.totalElements).toBe(25);
    });
  });

  describe('create', () => {
    it('devrait créer un nouveau groupe', async () => {
      const newGroupe = { nom: 'Nouveau Groupe' };
      mockAxios.onPost('/groupes').reply(201, { idGroupe: 1, ...newGroupe });

      const result = await groupeService.create(newGroupe);

      expect(result.idGroupe).toBe(1);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un groupe', async () => {
      const updateData = { nom: 'Modifié' };
      mockAxios.onPut('/groupes/1').reply(200, { idGroupe: 1, ...updateData });

      const result = await groupeService.update(1, updateData);

      expect(result.nom).toBe('Modifié');
    });
  });

  describe('delete', () => {
    it('devrait supprimer un groupe', async () => {
      mockAxios.onDelete('/groupes/1').reply(204);

      const result = await groupeService.delete(1);

      expect(result).toBe(true);
    });

    it('devrait retourner false en cas d\'erreur', async () => {
      mockAxios.onDelete('/groupes/999').reply(404);

      const result = await groupeService.delete(999);

      expect(result).toBe(false);
    });
  });
});
