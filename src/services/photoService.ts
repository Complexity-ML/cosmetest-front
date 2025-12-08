// src/services/photoService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '';

interface PhotoCheckResponse {
  exists: boolean;
  url: string | null;
}

interface PhotoInfo {
  photos: any[];
  photoCount: number;
  volontaireInfo?: {
    nom?: string;
    dateNaissance?: string;
  };
}

interface UploadResponse {
  success: boolean;
  message: string;
}

const photoService = {
  /**
   * Vérifie si une photo existe pour un volontaire donné par son ID
   */
  checkVolontairePhotoById: async (volontaireId: number, type: string = 'face'): Promise<PhotoCheckResponse> => {
    try {
      const response = await axios.get<{ exists: boolean; photoUrl?: string }>(`${API_URL}/api/volontaires/${volontaireId}/photos/${type}`);

      return {
        exists: response.data.exists,
        url: response.data.exists ? response.data.photoUrl || null : null
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { exists: false, url: null };
      }
      console.error('Erreur lors de la vérification de la photo par ID:', error);
      return { exists: false, url: null };
    }
  },

  /**
   * Vérifie si une photo existe pour un volontaire donné par nom (méthode de fallback)
   */
  checkVolontairePhoto: async (nomVolontaire: string): Promise<PhotoCheckResponse> => {
    try {
      // Essayer différentes variantes de noms
      const nameVariants = [
        nomVolontaire.toLowerCase(),                           // "da silva costa"
        nomVolontaire.toLowerCase().replace(/\s+/g, '_'),      // "da_silva_costa"
        nomVolontaire.toLowerCase().replace(/\s+/g, ''),       // "dasilvacosta"
      ];

      // Extensions possibles
      const extensions = ['.jpg', '.JPG', '.jpeg', '.JPEG', '.png', '.PNG', '.pdf', '.PDF'];

      // Tester les variantes de base (sans chiffres d'abord)
      for (const nameVariant of nameVariants) {
        for (const ext of extensions) {
          const filename = `f_${nameVariant}${ext}`;

          try {
            const response = await axios.get<{ exists: boolean }>(`${API_URL}/api/photos/check`, {
              params: { filename }
            });

            if (response.data.exists) {
              console.log(`Photo trouvée: ${filename}`);
              return {
                exists: true,
                url: `${API_URL}/photos/volontaires/${filename}`
              };
            }
          } catch (error) {
            continue;
          }
        }
      }

      console.log(`Aucune photo trouvée pour: ${nomVolontaire}`);
      return { exists: false, url: null };

    } catch (error) {
      console.error('Erreur lors de la vérification de la photo:', error);
      return { exists: false, url: null };
    }
  },

  /**
   * Récupère toutes les photos d'un volontaire
   */
  getAllVolontairePhotos: async (volontaireId: number): Promise<PhotoInfo> => {
    try {
      const response = await axios.get<PhotoInfo>(`${API_URL}/api/volontaires/${volontaireId}/photos`);

      return {
        photos: response.data.photos || [],
        photoCount: response.data.photoCount || 0,
        volontaireInfo: {
          nom: response.data.volontaireInfo?.nom,
          dateNaissance: response.data.volontaireInfo?.dateNaissance
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des photos:', error);
      return { photos: [], photoCount: 0 };
    }
  },

  /**
   * Obtient l'URL de l'image directement
   */
  getPhotoImageUrl: (volontaireId: number, type: string = 'face'): string => {
    return `${API_URL}/api/volontaires/${volontaireId}/photos/${type}/image`;
  },

  /**
   * Obtient l'URL de la miniature
   */
  getPhotoThumbnailUrl: (volontaireId: number, type: string = 'face'): string => {
    return `${API_URL}/api/volontaires/${volontaireId}/photos/${type}/thumbnail`;
  },

  /**
   * Télécharge une photo pour un volontaire
   */
  uploadVolontairePhoto: async (volontaireId: string | number, photoFile: File): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);

      await axios.post(`${API_URL}/api/volontaires/${volontaireId}/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        message: 'Photo téléchargée avec succès'
      };
    } catch (error: any) {
      console.error('Erreur lors du téléchargement de la photo:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Erreur lors du téléchargement de la photo'
      };
    }
  }
};

export default photoService;
