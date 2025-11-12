// ============================================================
// photoService.test.ts - Tests pour le service photos
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import photoService from '../photoService';

// Mock axios module
vi.mock('axios');

describe('PhotoService', () => {
  const mockGet = vi.fn();
  const mockPost = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});

    // Setup axios mock
    (axios.get as any) = mockGet;
    (axios.post as any) = mockPost;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkVolontairePhotoById', () => {
    it('devrait vérifier qu\'une photo existe', async () => {
      mockGet.mockResolvedValue({
        data: { exists: true, photoUrl: '/photos/1_face.jpg' }
      });

      const result = await photoService.checkVolontairePhotoById(1, 'face');

      expect(result.exists).toBe(true);
      expect(result.url).toBe('/photos/1_face.jpg');
    });

    it('devrait retourner false si la photo n\'existe pas (404)', async () => {
      mockGet.mockRejectedValue({ response: { status: 404 } });

      const result = await photoService.checkVolontairePhotoById(999, 'face');

      expect(result.exists).toBe(false);
      expect(result.url).toBeNull();
    });

    it('devrait gérer les erreurs réseau', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));

      const result = await photoService.checkVolontairePhotoById(1);

      expect(result.exists).toBe(false);
      expect(result.url).toBeNull();
    });
  });

  describe('checkVolontairePhoto', () => {
    it('devrait trouver une photo', async () => {
      mockGet.mockResolvedValue({ data: { exists: true } });

      const result = await photoService.checkVolontairePhoto('test');

      expect(result.exists).toBe(true);
    });

    it('devrait retourner false si aucune photo trouvée', async () => {
      mockGet.mockResolvedValue({ data: { exists: false } });

      const result = await photoService.checkVolontairePhoto('inconnu');

      expect(result.exists).toBe(false);
    });
  });

  describe('getAllVolontairePhotos', () => {
    it('devrait récupérer toutes les photos', async () => {
      const mockPhotos = {
        photos: [{ type: 'face' }],
        photoCount: 1,
        volontaireInfo: { nom: 'Test' }
      };

      mockGet.mockResolvedValue({ data: mockPhotos });

      const result = await photoService.getAllVolontairePhotos(1);

      expect(result.photos).toHaveLength(1);
      expect(result.photoCount).toBe(1);
    });

    it('devrait retourner un tableau vide en cas d\'erreur', async () => {
      mockGet.mockRejectedValue(new Error('Error'));

      const result = await photoService.getAllVolontairePhotos(999);

      expect(result.photos).toEqual([]);
      expect(result.photoCount).toBe(0);
    });
  });

  describe('getPhotoImageUrl', () => {
    it('devrait générer l\'URL correcte', () => {
      const url = photoService.getPhotoImageUrl(1, 'face');
      expect(url).toContain('/volontaires/1/photos/face/image');
    });
  });

  describe('getPhotoThumbnailUrl', () => {
    it('devrait générer l\'URL correcte', () => {
      const url = photoService.getPhotoThumbnailUrl(1, 'face');
      expect(url).toContain('/volontaires/1/photos/face/thumbnail');
    });
  });

  describe('uploadVolontairePhoto', () => {
    it('devrait uploader une photo avec succès', async () => {
      mockPost.mockResolvedValue({ data: {} });

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await photoService.uploadVolontairePhoto(1, file);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Photo téléchargée avec succès');
    });

    it('devrait gérer les erreurs d\'upload', async () => {
      mockPost.mockRejectedValue({
        response: { data: { message: 'Erreur serveur' } }
      });

      const file = new File(['photo'], 'photo.jpg', { type: 'image/jpeg' });
      const result = await photoService.uploadVolontairePhoto(1, file);

      expect(result.success).toBe(false);
      expect(result.message).toContain('Erreur');
    });
  });
});
