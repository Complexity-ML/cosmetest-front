// ============================================================
// calendarService.test.ts - Tests pour le service calendrier
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import calendarService from '../calendarService';

describe('CalendarService', () => {
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

  describe('getPeriode', () => {
    it('devrait récupérer la période calendrier', async () => {
      const mockPeriode = {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      mockAxios.onGet('/calendrier/periode').reply(200, mockPeriode);

      const result = await calendarService.getPeriode();

      expect(result).toEqual(mockPeriode);
    });

    it('devrait retourner null en cas d\'erreur', async () => {
      mockAxios.onGet('/calendrier/periode').reply(404);

      await expect(calendarService.getPeriode()).rejects.toThrow('Erreur API');
    });

    it('devrait gérer les requêtes annulables', async () => {
      const controller = new AbortController();
      mockAxios.onGet('/calendrier/periode').reply(200, {});

      controller.abort();

      await expect(calendarService.getPeriode({ signal: controller.signal }))
        .rejects.toThrow();
    });
  });

  describe('getByWeek', () => {
    it('devrait récupérer les événements d\'une semaine', async () => {
      const mockEvents = [
        { id: 1, title: 'Event 1', date: '2024-01-15' },
        { id: 2, title: 'Event 2', date: '2024-01-16' }
      ];

      mockAxios.onGet('/calendrier/semaine').reply(200, mockEvents);

      const result = await calendarService.getByWeek(3, 2024);

      expect(result).toEqual(mockEvents);
      expect(mockAxios.history.get[0].params).toEqual({
        weekNumber: 3,
        year: 2024
      });
    });

    it('devrait rejeter si weekNumber est invalide', async () => {
      await expect(calendarService.getByWeek(0, 2024)).rejects.toThrow('weekNumber doit être un entier entre 1 et 53');
      await expect(calendarService.getByWeek(54, 2024)).rejects.toThrow('weekNumber doit être un entier entre 1 et 53');
      await expect(calendarService.getByWeek(1.5, 2024)).rejects.toThrow('weekNumber doit être un entier entre 1 et 53');
    });

    it('devrait rejeter si year est invalide', async () => {
      await expect(calendarService.getByWeek(1, 1969)).rejects.toThrow('year doit être une année valide');
      await expect(calendarService.getByWeek(1, 2024.5)).rejects.toThrow('year doit être une année valide');
    });

    it('devrait gérer les erreurs API', async () => {
      mockAxios.onGet('/calendrier/semaine').reply(500);

      await expect(calendarService.getByWeek(1, 2024)).rejects.toThrow('Erreur API');
    });

    it('devrait gérer les requêtes annulables', async () => {
      const controller = new AbortController();
      mockAxios.onGet('/calendrier/semaine').reply(200, []);

      controller.abort();

      await expect(calendarService.getByWeek(1, 2024, { signal: controller.signal }))
        .rejects.toThrow();
    });
  });

  describe('getRdvByStudy', () => {
    it('devrait récupérer les RDV d\'une étude avec un ID numérique', async () => {
      const mockRdvs = [
        { id: 1, date: '2024-01-15', time: '10:00' },
        { id: 2, date: '2024-01-16', time: '14:00' }
      ];

      mockAxios.onGet('/calendrier/etude/123/rdvs').reply(200, mockRdvs);

      const result = await calendarService.getRdvByStudy(123);

      expect(result).toEqual(mockRdvs);
    });

    it('devrait récupérer les RDV d\'une étude avec un ID string', async () => {
      const mockRdvs = [{ id: 1 }];

      mockAxios.onGet('/calendrier/etude/ABC123/rdvs').reply(200, mockRdvs);

      const result = await calendarService.getRdvByStudy('ABC123');

      expect(result).toEqual(mockRdvs);
    });

    it('devrait encoder correctement les caractères spéciaux dans l\'ID', async () => {
      mockAxios.onGet('/calendrier/etude/test%20123/rdvs').reply(200, []);

      await calendarService.getRdvByStudy('test 123');

      expect(mockAxios.history.get[0].url).toContain('test%20123');
    });

    it('devrait rejeter si studyId est null', async () => {
      await expect(calendarService.getRdvByStudy(null as any)).rejects.toThrow('studyId est requis');
    });

    it('devrait rejeter si studyId est undefined', async () => {
      await expect(calendarService.getRdvByStudy(undefined as any)).rejects.toThrow('studyId est requis');
    });

    it('devrait rejeter si studyId est vide', async () => {
      await expect(calendarService.getRdvByStudy('')).rejects.toThrow('studyId est requis');
      await expect(calendarService.getRdvByStudy('   ')).rejects.toThrow('studyId est requis');
    });

    it('devrait gérer les erreurs API', async () => {
      mockAxios.onGet('/calendrier/etude/123/rdvs').reply(404);

      await expect(calendarService.getRdvByStudy(123)).rejects.toThrow('Erreur API');
    });

    it('devrait gérer les erreurs réseau', async () => {
      mockAxios.onGet('/calendrier/etude/123/rdvs').networkError();

      await expect(calendarService.getRdvByStudy(123)).rejects.toThrow('Erreur réseau');
    });

    it('devrait gérer les requêtes annulables', async () => {
      const controller = new AbortController();
      mockAxios.onGet('/calendrier/etude/123/rdvs').reply(200, []);

      controller.abort();

      await expect(calendarService.getRdvByStudy(123, { signal: controller.signal }))
        .rejects.toThrow();
    });
  });
});
