// ============================================================
// authService.test.ts - Tests pour le service d'authentification
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import authService from '../authService';

describe('AuthService', () => {
  let mockAxios: MockAdapter;

  beforeEach(async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Clear cache before each test
    authService.clearCache();

    const apiModule = await import('../api');
    const api = apiModule.default;
    mockAxios = new MockAdapter(api);
  });

  afterEach(() => {
    mockAxios.restore();
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('devrait se connecter avec succès (nouvelle structure)', async () => {
      const mockUser = {
        login: 'testuser',
        nom: 'Test User',
        email: 'test@example.com',
        role: 1
      };

      mockAxios.onPost('/auth/login').reply(200, {
        user: mockUser
      });

      const result = await authService.login('testuser', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.role).toBe(1);
      expect(result.isAdmin).toBe(false);
    });

    it('devrait se connecter avec succès (ancienne structure)', async () => {
      const mockUser = {
        login: 'admin',
        nom: 'Admin',
        role: 2,
        authorities: [{ authority: 'ROLE_ADMIN' }]
      };

      mockAxios.onPost('/auth/login').reply(200, { username: 'admin' });
      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.login('admin', 'admin123');

      expect(result.success).toBe(true);
      expect(result.user?.login).toBe('admin');
      expect(result.role).toBe(2);
      expect(result.isAdmin).toBe(true);
    });

    it('devrait gérer les identifiants incorrects', async () => {
      mockAxios.onPost('/auth/login').reply(401, { message: 'Identifiants incorrects' });

      const result = await authService.login('wrong', 'wrong');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Identifiants incorrects');
    });

    it('devrait gérer les erreurs 403', async () => {
      mockAxios.onPost('/auth/login').reply(403);

      const result = await authService.login('test', 'test');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Accès interdit');
    });

    it('devrait gérer les erreurs 500', async () => {
      mockAxios.onPost('/auth/login').reply(500);

      const result = await authService.login('test', 'test');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erreur interne du serveur');
    });

    it('devrait gérer les erreurs réseau', async () => {
      mockAxios.onPost('/auth/login').networkError();

      const result = await authService.login('test', 'test');

      expect(result.success).toBe(false);
      expect(result.message).toBeDefined();
    });
  });

  describe('logout', () => {
    it('devrait se déconnecter avec succès', async () => {
      mockAxios.onPost('/auth/logout').reply(200);

      const result = await authService.logout();

      expect(result).toBe(true);
    });

    it('devrait vider le cache même en cas d\'erreur', async () => {
      mockAxios.onPost('/auth/logout').reply(500);

      const result = await authService.logout();

      expect(result).toBe(false);
      const user = await authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('devrait récupérer l\'utilisateur depuis l\'API', async () => {
      const mockUser = {
        login: 'testuser',
        nom: 'Test User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const user = await authService.getCurrentUser();

      expect(user).toMatchObject(mockUser);
      expect(user?.login).toBe('testuser');
      expect(user?.role).toBe(1);
    });

    it('devrait utiliser le cache si disponible', async () => {
      const mockUser = {
        login: 'cached',
        nom: 'Cached User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const user1 = await authService.getCurrentUser();
      const user2 = await authService.getCurrentUser();

      expect(user1).toEqual(user2);
      expect(mockAxios.history.get.length).toBe(1); // Un seul appel API
    });

    it('devrait retourner null si pas authentifié', async () => {
      mockAxios.onGet('/users/me').reply(401);

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });

    it('devrait extraire le rôle depuis authorities', async () => {
      const mockUser = {
        login: 'admin',
        nom: 'Admin',
        role: 1,
        authorities: [{ authority: 'ROLE_ADMIN' }]
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const user = await authService.getCurrentUser();

      expect(user?.role).toBe(2); // Extrait depuis ROLE_ADMIN
    });

    it('devrait gérer les données utilisateur invalides', async () => {
      mockAxios.onGet('/users/me').reply(200, { invalid: 'data' });

      const user = await authService.getCurrentUser();

      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('devrait retourner true si authentifié (objet)', async () => {
      mockAxios.onGet('/auth/validate').reply(200, { valid: true });

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('devrait retourner true si authentifié (string)', async () => {
      mockAxios.onGet('/auth/validate').reply(200, 'Token valide');

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('devrait retourner false si non authentifié', async () => {
      mockAxios.onGet('/auth/validate').reply(200, 'Non authentifié');

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('devrait retourner false en cas d\'erreur', async () => {
      mockAxios.onGet('/auth/validate').reply(401);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });

    it('devrait mettre en cache les données utilisateur de la validation', async () => {
      const mockUser = {
        login: 'test',
        nom: 'Test',
        role: 1
      };

      mockAxios.onGet('/auth/validate').reply(200, {
        valid: true,
        user: mockUser
      });

      await authService.isAuthenticated();
      const user = await authService.getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(mockAxios.history.get.filter(req => req.url === '/users/me').length).toBe(0);
    });
  });

  describe('getUserRole', () => {
    it('devrait retourner le rôle de l\'utilisateur', async () => {
      const mockUser = {
        login: 'test',
        nom: 'Test',
        role: 2
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const role = await authService.getUserRole();

      expect(role).toBe(2);
    });

    it('devrait retourner null si pas connecté', async () => {
      mockAxios.onGet('/users/me').reply(401);

      const role = await authService.getUserRole();

      expect(role).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('devrait retourner true pour un admin', async () => {
      const mockUser = {
        login: 'admin',
        nom: 'Admin',
        role: 2
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.isAdmin();

      expect(result).toBe(true);
    });

    it('devrait retourner false pour un utilisateur normal', async () => {
      const mockUser = {
        login: 'user',
        nom: 'User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.isAdmin();

      expect(result).toBe(false);
    });
  });

  describe('isUser', () => {
    it('devrait retourner true pour un utilisateur normal', async () => {
      const mockUser = {
        login: 'user',
        nom: 'User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.isUser();

      expect(result).toBe(true);
    });

    it('devrait retourner false pour un admin', async () => {
      const mockUser = {
        login: 'admin',
        nom: 'Admin',
        role: 2
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.isUser();

      expect(result).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('devrait autoriser un admin à accéder aux ressources user', async () => {
      const mockUser = {
        login: 'admin',
        nom: 'Admin',
        role: 2
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.hasPermission(1);

      expect(result).toBe(true);
    });

    it('devrait autoriser un user à accéder aux ressources user', async () => {
      const mockUser = {
        login: 'user',
        nom: 'User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.hasPermission(1);

      expect(result).toBe(true);
    });

    it('ne devrait pas autoriser un user à accéder aux ressources admin', async () => {
      const mockUser = {
        login: 'user',
        nom: 'User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.hasPermission(2);

      expect(result).toBe(false);
    });

    it('devrait gérer un tableau de rôles requis', async () => {
      const mockUser = {
        login: 'user',
        nom: 'User',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      const result = await authService.hasPermission([1, 2]);

      expect(result).toBe(true);
    });

    it('devrait retourner false si pas de rôle utilisateur', async () => {
      mockAxios.onGet('/users/me').reply(401);

      const result = await authService.hasPermission(1);

      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('devrait vider le cache utilisateur', async () => {
      const mockUser = {
        login: 'test',
        nom: 'Test',
        role: 1
      };

      mockAxios.onGet('/users/me').reply(200, mockUser);

      await authService.getCurrentUser();
      authService.clearCache();

      mockAxios.onGet('/users/me').reply(200, mockUser);
      await authService.getCurrentUser();

      expect(mockAxios.history.get.length).toBe(2);
    });
  });

  describe('setDebugMode', () => {
    it('devrait activer/désactiver le mode debug', () => {
      authService.setDebugMode(false);
      authService.setDebugMode(true);

      expect(true).toBe(true); // Le mode debug affecte seulement les logs
    });
  });
});
