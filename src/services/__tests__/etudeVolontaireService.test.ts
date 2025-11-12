// ============================================================
// etudeVolontaireService.test.ts - Tests pour le service étude-volontaire
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import etudeVolontaireService from '../etudeVolontaireService';

describe('EtudeVolontaireService', () => {
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
    it('devrait récupérer toutes les relations étude-volontaire', async () => {
      mockAxios.onGet('/etude-volontaires').reply(200, [{ id: 1 }]);
      const result = await etudeVolontaireService.getAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('getVolontairesByEtude', () => {
    it('devrait récupérer les volontaires d\'une étude', async () => {
      mockAxios.onGet('/etude-volontaires/etude/10').reply(200, [{ idEtude: 10 }]);
      const result = await etudeVolontaireService.getVolontairesByEtude(10);
      expect(result).toBeDefined();
    });
  });

  describe('getEtudesByVolontaire', () => {
    it('devrait récupérer les études d\'un volontaire', async () => {
      mockAxios.onGet('/etude-volontaires/volontaire/5').reply(200, [{ idVolontaire: 5 }]);
      const result = await etudeVolontaireService.getEtudesByVolontaire(5);
      expect(result).toBeDefined();
    });
  });

  describe('create', () => {
    it('devrait créer une relation étude-volontaire', async () => {
      mockAxios.onPost('/etude-volontaires').reply(201, { id: 1 });
      const result = await etudeVolontaireService.create({
        idEtude: 10,
        idVolontaire: 5,
        statut: 'INSCRIT'
      });
      expect(result).toBeDefined();
    });
  });

  describe('delete', () => {
    it('devrait supprimer une relation', async () => {
      const associationId = {
        idEtude: 10,
        idGroupe: 0,
        idVolontaire: 5,
        iv: 0,
        numsujet: 0,
        paye: 0,
        statut: 'INSCRIT'
      };
      mockAxios.onDelete('/etude-volontaires/delete').reply(200);
      await expect(etudeVolontaireService.delete(associationId)).resolves.not.toThrow();
    });
  });
});
