// ============================================================
// api.test.ts - Tests pour le service API
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

// Mock window.location avant d'importer api
const mockLocation = {
  href: '',
  pathname: '/',
  search: '',
  hash: ''
};

Object.defineProperty(window, 'location', {
  writable: true,
  value: mockLocation
});

describe('API Service', () => {
  let mock: MockAdapter;
  let api: any;

  beforeEach(async () => {
    // Reset mock location
    mockLocation.href = '';
    mockLocation.pathname = '/';

    // Clear console mocks
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create new mock adapter
    mock = new MockAdapter(axios);

    // Clear module cache and re-import api
    vi.resetModules();
    const apiModule = await import('../api');
    api = apiModule.default;
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  describe('Configuration de base', () => {
    it('devrait être une instance Axios', () => {
      expect(api).toBeDefined();
      expect(api.defaults).toBeDefined();
    });

    it('devrait avoir la bonne baseURL configurée', () => {
      expect(api.defaults.baseURL).toBe('http://192.168.127.36:8888/api');
    });

    it('devrait avoir withCredentials activé', () => {
      expect(api.defaults.withCredentials).toBe(true);
    });

    it('devrait avoir le Content-Type JSON par défaut', () => {
      expect(api.defaults.headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Intercepteur de requête', () => {
    it('devrait permettre les requêtes normales de passer', async () => {
      mock.onGet('/test').reply(200, { success: true });

      const response = await api.get('/test');

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ success: true });
    });

    it('devrait logger les erreurs de requête', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mock.onGet('/test').networkError();

      try {
        await api.get('/test');
      } catch (error) {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Intercepteur de réponse - Gestion des succès', () => {
    it('devrait retourner la réponse pour les requêtes réussies', async () => {
      const mockData = { message: 'Success', data: { id: 1, name: 'Test' } };
      mock.onGet('/users/1').reply(200, mockData);

      const response = await api.get('/users/1');

      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockData);
    });

    it('devrait gérer les réponses 201 (Created)', async () => {
      const mockData = { id: 1, created: true };
      mock.onPost('/users').reply(201, mockData);

      const response = await api.post('/users', { name: 'New User' });

      expect(response.status).toBe(201);
      expect(response.data).toEqual(mockData);
    });
  });

  describe('Intercepteur de réponse - Gestion des erreurs 401', () => {
    it('devrait rediriger vers /login pour une erreur 401', async () => {
      mock.onGet('/protected').reply(401, { error: 'Unauthorized' });

      try {
        await api.get('/protected');
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('/login');
    });

    it('ne devrait PAS rediriger si déjà sur la page de connexion', async () => {
      mockLocation.pathname = '/cosmetest/login';
      mock.onGet('/protected').reply(401);

      try {
        await api.get('/protected');
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('');
    });

    it('ne devrait PAS rediriger pour une requête /auth/login', async () => {
      mock.onPost('/auth/login').reply(401);

      try {
        await api.post('/auth/login', { username: 'test' });
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('');
    });

    it('ne devrait PAS rediriger pour une requête /auth/validate', async () => {
      mock.onGet('/auth/validate').reply(401);

      try {
        await api.get('/auth/validate');
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('');
    });
  });

  describe('Intercepteur de réponse - Gestion des erreurs 403', () => {
    it('devrait rediriger vers /login pour une erreur 403', async () => {
      mock.onGet('/admin').reply(403, { error: 'Forbidden' });

      try {
        await api.get('/admin');
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('/login');
    });

    it('ne devrait PAS rediriger si déjà sur la page de connexion (403)', async () => {
      mockLocation.pathname = '/cosmetest/login';
      mock.onGet('/admin').reply(403);

      try {
        await api.get('/admin');
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('');
    });
  });

  describe('Intercepteur de réponse - Autres erreurs', () => {
    it('devrait logger les erreurs 404', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mock.onGet('/notfound').reply(404, { error: 'Not Found' });

      try {
        await api.get('/notfound');
      } catch (error) {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('devrait logger les erreurs 500', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mock.onGet('/error').reply(500, { error: 'Internal Server Error' });

      try {
        await api.get('/error');
      } catch (error) {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('ne devrait PAS rediriger pour les erreurs 400', async () => {
      mock.onPost('/users').reply(400, { error: 'Bad Request' });

      try {
        await api.post('/users', {});
      } catch (error) {
        // Expected to fail
      }

      expect(window.location.href).toBe('');
    });

    it('devrait gérer les erreurs réseau', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mock.onGet('/test').networkError();

      try {
        await api.get('/test');
      } catch (error) {
        expect(error).toBeDefined();
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('devrait gérer les timeouts', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mock.onGet('/slow').timeout();

      try {
        await api.get('/slow');
      } catch (error) {
        expect(error).toBeDefined();
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('Méthodes HTTP', () => {
    it('devrait effectuer une requête GET', async () => {
      mock.onGet('/users').reply(200, [{ id: 1, name: 'User 1' }]);

      const response = await api.get('/users');

      expect(response.status).toBe(200);
      expect(response.data).toHaveLength(1);
    });

    it('devrait effectuer une requête POST', async () => {
      const newUser = { name: 'New User', email: 'new@test.com' };
      mock.onPost('/users', newUser).reply(201, { id: 1, ...newUser });

      const response = await api.post('/users', newUser);

      expect(response.status).toBe(201);
      expect(response.data.name).toBe(newUser.name);
    });

    it('devrait effectuer une requête PUT', async () => {
      const updatedUser = { name: 'Updated User' };
      mock.onPut('/users/1', updatedUser).reply(200, { id: 1, ...updatedUser });

      const response = await api.put('/users/1', updatedUser);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(updatedUser.name);
    });

    it('devrait effectuer une requête DELETE', async () => {
      mock.onDelete('/users/1').reply(204);

      const response = await api.delete('/users/1');

      expect(response.status).toBe(204);
    });

    it('devrait effectuer une requête PATCH', async () => {
      const patch = { name: 'Patched Name' };
      mock.onPatch('/users/1', patch).reply(200, { id: 1, ...patch });

      const response = await api.patch('/users/1', patch);

      expect(response.status).toBe(200);
      expect(response.data.name).toBe(patch.name);
    });
  });

  describe('Gestion des paramètres de requête', () => {
    it('devrait envoyer des query parameters avec GET', async () => {
      mock.onGet('/users', { params: { page: 1, limit: 10 } }).reply(200, []);

      const response = await api.get('/users', { params: { page: 1, limit: 10 } });

      expect(response.status).toBe(200);
    });

    it('devrait envoyer des headers personnalisés', async () => {
      mock.onGet('/users').reply((config) => {
        if (config.headers && config.headers['X-Custom-Header'] === 'test') {
          return [200, { success: true }];
        }
        return [400, {}];
      });

      const response = await api.get('/users', {
        headers: { 'X-Custom-Header': 'test' }
      });

      expect(response.status).toBe(200);
    });
  });

  describe('Logging des erreurs', () => {
    it('devrait logger l\'URL, le status et les données d\'erreur', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error');
      mock.onGet('/test').reply(400, { message: 'Bad Request' });

      try {
        await api.get('/test');
      } catch (error) {
        // Expected to fail
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erreur de réponse API:',
        expect.objectContaining({
          url: '/test',
          status: 400,
          data: { message: 'Bad Request' }
        })
      );
    });
  });
});
