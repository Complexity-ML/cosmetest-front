// ============================================================
// annulationService.test.ts - Tests pour le service d'annulation
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import annulationService, { cleanTextForDatabase } from '../annulationService';

describe('AnnulationService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Import api module and get axios instance
    const apiModule = await import('../api');
    const api = apiModule.default;

    // Create mock adapter for the api instance
    mockAxios = new MockAdapter(api);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('cleanTextForDatabase', () => {
    it('devrait retourner une chaîne vide pour null', () => {
      expect(cleanTextForDatabase(null)).toBe('');
    });

    it('devrait retourner une chaîne vide pour undefined', () => {
      expect(cleanTextForDatabase(undefined)).toBe('');
    });

    it('devrait remplacer les flèches par du texte', () => {
      expect(cleanTextForDatabase('texte → autre')).toBe('texte vers autre');
      expect(cleanTextForDatabase('texte ← autre')).toBe('texte depuis autre');
      expect(cleanTextForDatabase('texte ↑ autre')).toBe('texte haut autre');
      expect(cleanTextForDatabase('texte ↓ autre')).toBe('texte bas autre');
    });

    it('devrait remplacer les symboles par du texte', () => {
      expect(cleanTextForDatabase('✓ Valide')).toBe('OK Valide');
      expect(cleanTextForDatabase('✗ Erreur')).toBe('ERREUR Erreur');
      expect(cleanTextForDatabase('⚠ Attention')).toBe('ATTENTION Attention');
    });

    it('devrait remplacer les emojis par du texte', () => {
      expect(cleanTextForDatabase('🚫 Interdit')).toBe('INTERDIT Interdit');
      expect(cleanTextForDatabase('📝 Note')).toBe('NOTE Note');
      expect(cleanTextForDatabase('💾 Sauvegarde')).toBe('SAUVEGARDE Sauvegarde');
      expect(cleanTextForDatabase('🗑️ Supprimer')).toBe('SUPPRIMER Supprimer');
      expect(cleanTextForDatabase('❌ Annule')).toBe('ANNULE Annule');
      expect(cleanTextForDatabase('📈 Surbook')).toBe('SURBOOK Surbook');
      expect(cleanTextForDatabase('🤝 Parrainage')).toBe('PARRAINAGE Parrainage');
      expect(cleanTextForDatabase('❓ Inconnu')).toBe('INCONNU Inconnu');
    });

    it('devrait nettoyer les espaces multiples', () => {
      expect(cleanTextForDatabase('texte    avec   espaces')).toBe('texte avec espaces');
    });

    it('devrait conserver les caractères accentués', () => {
      expect(cleanTextForDatabase('Texte normal')).toBe('Texte normal');
      expect(cleanTextForDatabase('étude annulée')).toBe('étude annulée');
      expect(cleanTextForDatabase('Problème de santé')).toBe('Problème de santé');
    });

    it('devrait combiner plusieurs opérations de nettoyage', () => {
      const input = '✓ Validation → OK   🚫';
      const result = cleanTextForDatabase(input);
      expect(result).toBe('OK Validation vers OK INTERDIT');
    });
  });

  describe('create', () => {
    it('devrait créer une nouvelle annulation', async () => {
      const newAnnulation = {
        idVol: 1,
        idEtude: 10,
        dateAnnulation: '2024-01-15',
        commentaire: 'Problème de santé'
      };

      const expectedResponse = { id: 1, ...newAnnulation };
      mockAxios.onPost('/annulations').reply(200, expectedResponse);

      const result = await annulationService.create(newAnnulation);

      expect(result).toEqual(expectedResponse);
    });

    it('devrait nettoyer le commentaire avant envoi', async () => {
      const newAnnulation = {
        idVol: 1,
        idEtude: 10,
        dateAnnulation: '2024-01-15',
        commentaire: 'Annulation → urgent ✓'
      };

      mockAxios.onPost('/annulations').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.commentaire).toBe('Annulation vers urgent OK');
        return [200, { id: 1, ...data }];
      });

      await annulationService.create(newAnnulation);
    });

    it('devrait gérer les erreurs de création', async () => {
      mockAxios.onPost('/annulations').reply(500);

      await expect(annulationService.create({
        idVol: 1,
        idEtude: 10,
        dateAnnulation: '2024-01-15',
        commentaire: 'Test'
      })).rejects.toThrow();
    });
  });

  describe('getAll', () => {
    it('devrait récupérer toutes les annulations', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 1, idEtude: 10, dateAnnulation: '2024-01-15', commentaire: 'Test 1' },
        { id: 2, idVol: 2, idEtude: 11, dateAnnulation: '2024-01-16', commentaire: 'Test 2' }
      ];

      mockAxios.onGet('/annulations').reply(200, mockAnnulations);

      const result = await annulationService.getAll();

      expect(result).toHaveLength(2);
      expect(result).toEqual(mockAnnulations);
    });

    it('devrait gérer les erreurs de récupération', async () => {
      mockAxios.onGet('/annulations').reply(500);

      await expect(annulationService.getAll()).rejects.toThrow();
    });
  });

  describe('getById', () => {
    it('devrait récupérer une annulation par ID', async () => {
      const mockAnnulation = {
        id: 1,
        idVol: 1,
        idEtude: 10,
        dateAnnulation: '2024-01-15',
        commentaire: 'Test'
      };

      mockAxios.onGet('/annulations/1').reply(200, mockAnnulation);

      const result = await annulationService.getById(1);

      expect(result).toEqual(mockAnnulation);
    });

    it('devrait gérer les erreurs pour un ID invalide', async () => {
      mockAxios.onGet('/annulations/999').reply(404);

      await expect(annulationService.getById(999)).rejects.toThrow();
    });
  });

  describe('getByVolontaire', () => {
    it('devrait récupérer les annulations d\'un volontaire', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 5, idEtude: 10, dateAnnulation: '2024-01-15', commentaire: 'Test 1' },
        { id: 2, idVol: 5, idEtude: 11, dateAnnulation: '2024-01-16', commentaire: 'Test 2' }
      ];

      mockAxios.onGet('/annulations/volontaire/5').reply(200, mockAnnulations);

      const result = await annulationService.getByVolontaire(5);

      expect(result).toHaveLength(2);
      expect(result.every(a => a.idVol === 5)).toBe(true);
    });

    it('devrait gérer les erreurs de récupération par volontaire', async () => {
      mockAxios.onGet('/annulations/volontaire/999').reply(500);

      await expect(annulationService.getByVolontaire(999)).rejects.toThrow();
    });
  });

  describe('getByEtude', () => {
    it('devrait récupérer les annulations d\'une étude', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 1, idEtude: 20, dateAnnulation: '2024-01-15', commentaire: 'Test 1' },
        { id: 2, idVol: 2, idEtude: 20, dateAnnulation: '2024-01-16', commentaire: 'Test 2' }
      ];

      mockAxios.onGet('/annulations/etude/20').reply(200, mockAnnulations);

      const result = await annulationService.getByEtude(20);

      expect(result).toHaveLength(2);
      expect(result.every(a => a.idEtude === 20)).toBe(true);
    });

    it('devrait gérer les erreurs de récupération par étude', async () => {
      mockAxios.onGet('/annulations/etude/999').reply(500);

      await expect(annulationService.getByEtude(999)).rejects.toThrow();
    });
  });

  describe('getByVolontaireAndEtude', () => {
    it('devrait récupérer les annulations d\'un volontaire pour une étude', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 5, idEtude: 20, dateAnnulation: '2024-01-15', commentaire: 'Test' }
      ];

      mockAxios.onGet('/annulations/volontaire/5/etude/20').reply(200, mockAnnulations);

      const result = await annulationService.getByVolontaireAndEtude(5, 20);

      expect(result).toHaveLength(1);
      expect(result[0].idVol).toBe(5);
      expect(result[0].idEtude).toBe(20);
    });

    it('devrait retourner un tableau vide si aucune annulation', async () => {
      mockAxios.onGet('/annulations/volontaire/5/etude/999').reply(200, []);

      const result = await annulationService.getByVolontaireAndEtude(5, 999);

      expect(result).toHaveLength(0);
    });
  });

  describe('getRecentByVolontaire', () => {
    it('devrait récupérer les annulations récentes d\'un volontaire', async () => {
      const mockAnnulations = [
        { id: 2, idVol: 5, idEtude: 20, dateAnnulation: '2024-01-16', commentaire: 'Récent' },
        { id: 1, idVol: 5, idEtude: 20, dateAnnulation: '2024-01-15', commentaire: 'Plus ancien' }
      ];

      mockAxios.onGet('/annulations/volontaire/5/recent').reply(200, mockAnnulations);

      const result = await annulationService.getRecentByVolontaire(5);

      expect(result).toHaveLength(2);
      expect(result[0].dateAnnulation).toBe('2024-01-16');
    });
  });

  describe('getByDate', () => {
    it('devrait récupérer les annulations à une date spécifique', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 1, idEtude: 10, dateAnnulation: '2024-01-15', commentaire: 'Test 1' },
        { id: 2, idVol: 2, idEtude: 11, dateAnnulation: '2024-01-15', commentaire: 'Test 2' }
      ];

      mockAxios.onGet('/annulations/date/2024-01-15').reply(200, mockAnnulations);

      const result = await annulationService.getByDate('2024-01-15');

      expect(result).toHaveLength(2);
      expect(result.every(a => a.dateAnnulation === '2024-01-15')).toBe(true);
    });
  });

  describe('searchByCommentaire', () => {
    it('devrait rechercher des annulations par mot-clé', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 1, idEtude: 10, dateAnnulation: '2024-01-15', commentaire: 'Problème de santé' }
      ];

      mockAxios.onGet('/annulations/search', { params: { keyword: 'santé' } }).reply(200, mockAnnulations);

      const result = await annulationService.searchByCommentaire('santé');

      expect(result).toHaveLength(1);
      expect(result[0].commentaire).toContain('santé');
    });

    it('devrait retourner un tableau vide si aucun résultat', async () => {
      mockAxios.onGet('/annulations/search').reply(200, []);

      const result = await annulationService.searchByCommentaire('inexistant');

      expect(result).toHaveLength(0);
    });
  });

  describe('getAllPaginated', () => {
    it('devrait récupérer les annulations paginées avec options par défaut', async () => {
      const mockResponse = {
        content: [
          { id: 1, idVol: 1, idEtude: 10, dateAnnulation: '2024-01-15', commentaire: 'Test 1' }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      mockAxios.onGet('/annulations/paginated').reply(200, mockResponse);

      const result = await annulationService.getAllPaginated();

      expect(result.content).toHaveLength(1);
      expect(result.totalElements).toBe(1);
      expect(result.size).toBe(10);
    });

    it('devrait récupérer les annulations paginées avec options personnalisées', async () => {
      const mockResponse = {
        content: [],
        totalElements: 50,
        totalPages: 5,
        size: 10,
        number: 2
      };

      mockAxios.onGet('/annulations/paginated', {
        params: { page: 2, size: 10, sortBy: 'id', direction: 'ASC' }
      }).reply(200, mockResponse);

      const result = await annulationService.getAllPaginated({
        page: 2,
        size: 10,
        sortBy: 'id',
        direction: 'ASC'
      });

      expect(result.number).toBe(2);
      expect(result.totalPages).toBe(5);
    });
  });

  describe('countByVolontaire', () => {
    it('devrait compter le nombre d\'annulations d\'un volontaire', async () => {
      mockAxios.onGet('/annulations/count/volontaire/5').reply(200, 3);

      const result = await annulationService.countByVolontaire(5);

      expect(result).toBe(3);
    });

    it('devrait retourner 0 si le volontaire n\'a pas d\'annulations', async () => {
      mockAxios.onGet('/annulations/count/volontaire/999').reply(200, 0);

      const result = await annulationService.countByVolontaire(999);

      expect(result).toBe(0);
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une annulation', async () => {
      const updateData = { commentaire: 'Nouveau commentaire' };
      const expectedResponse = {
        id: 1,
        idVol: 1,
        idEtude: 10,
        dateAnnulation: '2024-01-15',
        commentaire: 'Nouveau commentaire'
      };

      mockAxios.onPut('/annulations/1').reply(200, expectedResponse);

      const result = await annulationService.update(1, updateData);

      expect(result.commentaire).toBe('Nouveau commentaire');
    });

    it('devrait nettoyer le commentaire lors de la mise à jour', async () => {
      const updateData = { commentaire: 'Mise a jour → OK ✓' };

      mockAxios.onPut('/annulations/1').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.commentaire).toBe('Mise a jour vers OK OK');
        return [200, { id: 1, ...data }];
      });

      await annulationService.update(1, updateData);
    });

    it('devrait gérer les erreurs de mise à jour', async () => {
      mockAxios.onPut('/annulations/999').reply(404);

      await expect(annulationService.update(999, { commentaire: 'Test' })).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('devrait supprimer une annulation', async () => {
      mockAxios.onDelete('/annulations/1').reply(204);

      await expect(annulationService.delete(1)).resolves.not.toThrow();
    });

    it('devrait gérer les erreurs de suppression', async () => {
      mockAxios.onDelete('/annulations/999').reply(404);

      await expect(annulationService.delete(999)).rejects.toThrow();
    });
  });

  describe('hasAnnulationForEtude', () => {
    it('devrait retourner true si le volontaire a des annulations pour l\'étude', async () => {
      const mockAnnulations = [
        { id: 1, idVol: 5, idEtude: 20, dateAnnulation: '2024-01-15', commentaire: 'Test' }
      ];

      mockAxios.onGet('/annulations/volontaire/5/etude/20').reply(200, mockAnnulations);

      const result = await annulationService.hasAnnulationForEtude(5, 20);

      expect(result).toBe(true);
    });

    it('devrait retourner false si le volontaire n\'a pas d\'annulations pour l\'étude', async () => {
      mockAxios.onGet('/annulations/volontaire/5/etude/20').reply(200, []);

      const result = await annulationService.hasAnnulationForEtude(5, 20);

      expect(result).toBe(false);
    });

    it('devrait retourner false en cas d\'erreur', async () => {
      mockAxios.onGet('/annulations/volontaire/5/etude/20').reply(500);

      const result = await annulationService.hasAnnulationForEtude(5, 20);

      expect(result).toBe(false);
    });
  });

  describe('createWithValidation', () => {
    it('devrait créer une annulation avec validation complète', async () => {
      const data = {
        idVol: 1,
        idEtude: 10,
        dateAnnulation: '2024-01-15',
        commentaire: 'Test commentaire'
      };

      mockAxios.onPost('/annulations').reply(200, { id: 1, ...data });

      const result = await annulationService.createWithValidation(data);

      expect(result.id).toBe(1);
      expect(result.commentaire).toBe('Test commentaire');
    });

    it('devrait rejeter si idVol manque', async () => {
      await expect(annulationService.createWithValidation({
        idEtude: 10,
        commentaire: 'Test'
      })).rejects.toThrow('ID volontaire et ID étude sont requis');
    });

    it('devrait rejeter si idEtude manque', async () => {
      await expect(annulationService.createWithValidation({
        idVol: 1,
        commentaire: 'Test'
      })).rejects.toThrow('ID volontaire et ID étude sont requis');
    });

    it('devrait ajouter la date actuelle si non fournie', async () => {
      const today = new Date().toISOString().split('T')[0];

      mockAxios.onPost('/annulations').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.dateAnnulation).toBe(today);
        return [200, { id: 1, ...data }];
      });

      await annulationService.createWithValidation({
        idVol: 1,
        idEtude: 10,
        commentaire: 'Test'
      });
    });

    it('devrait utiliser un commentaire par défaut si vide', async () => {
      mockAxios.onPost('/annulations').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.commentaire).toBe('Annulation sans commentaire');
        return [200, { id: 1, ...data }];
      });

      await annulationService.createWithValidation({
        idVol: 1,
        idEtude: 10
      });
    });

    it('devrait utiliser "Annulation automatique" si le commentaire devient vide après nettoyage', async () => {
      mockAxios.onPost('/annulations').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.commentaire).toBe('Annulation automatique');
        return [200, { id: 1, ...data }];
      });

      // Commentaire qui devient vide après nettoyage (que des emojis)
      await annulationService.createWithValidation({
        idVol: 1,
        idEtude: 10,
        commentaire: '   '
      });
    });

    it('devrait nettoyer le commentaire avant création', async () => {
      mockAxios.onPost('/annulations').reply((config) => {
        const data = JSON.parse(config.data);
        expect(data.commentaire).toBe('Commentaire vers nettoyer OK');
        return [200, { id: 1, ...data }];
      });

      await annulationService.createWithValidation({
        idVol: 1,
        idEtude: 10,
        commentaire: 'Commentaire → nettoyer ✓'
      });
    });
  });
});
