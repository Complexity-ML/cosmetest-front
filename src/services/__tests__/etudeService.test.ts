// ============================================================
// etudeService.test.ts - Tests pour le service études
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import etudeService from '../etudeService';

describe('EtudeService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const apiModule = await import('../api');
    const api = apiModule.default;
    mockAxios = new MockAdapter(api);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('getById', () => {
    it('devrait récupérer une étude par ID', async () => {
      const mockEtude = {
        id: 1,
        ref: 'ET001',
        nom: 'Étude Test',
        dateDebut: '2024-01-01'
      };

      mockAxios.onGet('/etudes/1').reply(200, mockEtude);

      const result = await etudeService.getById(1);

      expect(result).toEqual(mockEtude);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockAxios.onGet('/etudes/999').reply(404);

      await expect(etudeService.getById(999)).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('devrait récupérer toutes les études', async () => {
      const mockEtudes = [
        { id: 1, ref: 'ET001', nom: 'Étude 1' },
        { id: 2, ref: 'ET002', nom: 'Étude 2' }
      ];

      mockAxios.onGet('/etudes').reply(200, mockEtudes);

      const result = await etudeService.getAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockEtudes);
    });

    it('devrait accepter des paramètres de recherche', async () => {
      mockAxios.onGet('/etudes').reply(200, []);

      await etudeService.getAll({ type: 'clinical', status: 'active' });

      expect(mockAxios.history.get[0].params).toEqual({
        type: 'clinical',
        status: 'active'
      });
    });
  });

  describe('getPaginated', () => {
    it('devrait récupérer les études avec pagination', async () => {
      const mockResponse = {
        content: [{ id: 1, ref: 'ET001' }],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      mockAxios.onGet('/etudes/paginated').reply(200, mockResponse);

      const result = await etudeService.getPaginated(0, 10);

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
    });

    it('devrait utiliser les paramètres de tri', async () => {
      mockAxios.onGet('/etudes/paginated').reply(200, { content: [] });

      await etudeService.getPaginated(0, 10, 'nom', 'ASC');

      expect(mockAxios.history.get[0].params).toEqual({
        page: 0,
        size: 10,
        sortBy: 'nom',
        direction: 'ASC'
      });
    });
  });

  describe('search', () => {
    it('devrait rechercher des études par terme', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001', nom: 'Test Study' }];

      mockAxios.onGet('/etudes/search').reply(200, mockEtudes);

      const result = await etudeService.search('Test');

      expect(result).toHaveLength(1);
      expect(mockAxios.history.get[0].params).toEqual({ searchTerm: 'Test' });
    });
  });

  describe('create', () => {
    it('devrait créer une nouvelle étude', async () => {
      const newEtude = {
        ref: 'ET003',
        nom: 'Nouvelle Étude',
        dateDebut: '2024-01-01'
      };

      mockAxios.onPost('/etudes').reply(201, { id: 3, ...newEtude });

      const result = await etudeService.create(newEtude);

      expect(result.id).toBe(3);
      expect(result.ref).toBe('ET003');
    });

    it('devrait gérer les erreurs de création', async () => {
      mockAxios.onPost('/etudes').reply(400);

      await expect(etudeService.create({})).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une étude', async () => {
      const updateData = { nom: 'Nom Modifié' };
      const mockResponse = { id: 1, ref: 'ET001', nom: 'Nom Modifié' };

      mockAxios.onPut('/etudes/1').reply(200, mockResponse);

      const result = await etudeService.update(1, updateData);

      expect(result.nom).toBe('Nom Modifié');
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      mockAxios.onPut('/etudes/999').reply(404);

      await expect(etudeService.update(999, {})).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('devrait supprimer une étude', async () => {
      mockAxios.onDelete('/etudes/1').reply(204);

      await expect(etudeService.delete(1)).resolves.not.toThrow();
    });

    it('devrait gérer les erreurs de suppression', async () => {
      mockAxios.onDelete('/etudes/999').reply(404);

      await expect(etudeService.delete(999)).rejects.toThrow();
    });
  });

  describe('getByRef', () => {
    it('devrait récupérer une étude par référence', async () => {
      const mockEtude = { id: 1, ref: 'ET001', nom: 'Test' };

      mockAxios.onGet('/etudes/ref/ET001').reply(200, mockEtude);

      const result = await etudeService.getByRef('ET001');

      expect(result.ref).toBe('ET001');
    });
  });

  describe('getByType', () => {
    it('devrait récupérer les études par type', async () => {
      const mockEtudes = [
        { id: 1, ref: 'ET001', type: 'clinical' },
        { id: 2, ref: 'ET002', type: 'clinical' }
      ];

      mockAxios.onGet('/etudes/type/clinical').reply(200, mockEtudes);

      const result = await etudeService.getByType('clinical');

      expect(result).toHaveLength(2);
    });
  });

  describe('getByPaymentStatus', () => {
    it('devrait récupérer les études par statut de paiement', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001', paye: 1 }];

      mockAxios.onGet('/etudes/paye/1').reply(200, mockEtudes);

      const result = await etudeService.getByPaymentStatus(1);

      expect(result).toHaveLength(1);
    });
  });

  describe('getActive', () => {
    it('devrait récupérer les études actives sans date', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001', actif: true }];

      mockAxios.onGet('/etudes/actives').reply(200, mockEtudes);

      const result = await etudeService.getActive();

      expect(result).toHaveLength(1);
    });

    it('devrait récupérer les études actives avec date', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001' }];

      mockAxios.onGet('/etudes/actives').reply(200, mockEtudes);

      await etudeService.getActive('2024-01-15');

      expect(mockAxios.history.get[0].params).toEqual({ date: '2024-01-15' });
    });
  });

  describe('getUpcoming', () => {
    it('devrait récupérer les études à venir', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001', dateDebut: '2024-12-01' }];

      mockAxios.onGet('/etudes/upcoming').reply(200, mockEtudes);

      const result = await etudeService.getUpcoming();

      expect(result).toHaveLength(1);
    });
  });

  describe('getCurrent', () => {
    it('devrait récupérer les études en cours', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001' }];

      mockAxios.onGet('/etudes/current').reply(200, mockEtudes);

      const result = await etudeService.getCurrent();

      expect(result).toHaveLength(1);
    });
  });

  describe('getCompleted', () => {
    it('devrait récupérer les études terminées', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001', dateFin: '2023-12-31' }];

      mockAxios.onGet('/etudes/completed').reply(200, mockEtudes);

      const result = await etudeService.getCompleted();

      expect(result).toHaveLength(1);
    });
  });

  describe('getByDateRange', () => {
    it('devrait récupérer les études par plage de dates', async () => {
      const mockEtudes = [{ id: 1, ref: 'ET001' }];

      mockAxios.onGet('/etudes/date-range').reply(200, mockEtudes);

      const result = await etudeService.getByDateRange('2024-01-01', '2024-12-31');

      expect(result).toHaveLength(1);
      expect(mockAxios.history.get[0].params).toEqual({
        debut: '2024-01-01',
        fin: '2024-12-31'
      });
    });
  });

  describe('checkRefExists', () => {
    it('devrait vérifier si une référence existe', async () => {
      mockAxios.onGet('/etudes/check-ref/ET001').reply(200, true);

      const result = await etudeService.checkRefExists('ET001');

      expect(result).toBe(true);
    });

    it('devrait retourner false si la référence n\'existe pas', async () => {
      mockAxios.onGet('/etudes/check-ref/NOTEXIST').reply(200, false);

      const result = await etudeService.checkRefExists('NOTEXIST');

      expect(result).toBe(false);
    });
  });

  describe('countByType', () => {
    it('devrait compter les études par type', async () => {
      mockAxios.onGet('/etudes/count/type/clinical').reply(200, 5);

      const result = await etudeService.countByType('clinical');

      expect(result).toBe(5);
    });
  });
});
