import { useState, useCallback } from 'react';
import volontaireService from '../services/volontaireService';

export interface CancellationResult {
  success: boolean;
  data?: any;
  error?: string;
  message: string;
  cancelled?: boolean;
}

export interface UseVolunteerCancellationReturn {
  // États
  isLoading: boolean;
  error: string | null;
  lastResult: any | null;

  // Actions principales
  cancelVolunteer: (idVol: number, motifAnnulation: string) => Promise<CancellationResult>;
  removeFromSlots: (idVol: number, motif: string) => Promise<CancellationResult>;

  // Actions avec confirmation
  confirmAndCancelVolunteer: (idVol: number, volunteerName: string, motifAnnulation: string) => Promise<CancellationResult>;
  confirmAndRemoveFromSlots: (idVol: number, volunteerName: string, motif: string) => Promise<CancellationResult>;

  // Utilitaires
  reset: () => void;
}

/**
 * Hook personnalisé pour gérer l'annulation des volontaires
 * et la suppression de leurs créneaux de rendez-vous
 */
export const useVolunteerCancellation = (): UseVolunteerCancellationReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any | null>(null);

  /**
   * Annule complètement un volontaire (supprime des créneaux, désassigne des études, archive)
   */
  const cancelVolunteer = useCallback(async (idVol: number, motifAnnulation: string): Promise<CancellationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await (volontaireService as any).annulerVolontaire(idVol, motifAnnulation);
      setLastResult(result);

      return {
        success: true,
        data: result,
        message: `Volontaire annulé avec succès. ${result.rdvsSupprimees} RDV supprimés, ${result.etudesDesassignees} études désassignées.`
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        message: `Erreur lors de l'annulation du volontaire: ${errorMessage}`
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Supprime un volontaire de ses créneaux sans l'archiver
   */
  const removeFromSlots = useCallback(async (idVol: number, motif: string): Promise<CancellationResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await (volontaireService as any).supprimerDesCreneaux(idVol, motif);
      setLastResult(result);

      return {
        success: true,
        data: result,
        message: `Volontaire supprimé des créneaux. ${result.rdvsModifies} rendez-vous modifiés.`
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Erreur inconnue';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        message: `Erreur lors de la suppression des créneaux: ${errorMessage}`
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Confirme l'annulation avec l'utilisateur avant de procéder
   */
  const confirmAndCancelVolunteer = useCallback(async (
    idVol: number,
    volunteerName: string,
    motifAnnulation: string
  ): Promise<CancellationResult> => {
    const confirmMessage = `Êtes-vous sûr de vouloir annuler le volontaire "${volunteerName}" ?\n\nCela va :\n- Le supprimer de tous ses créneaux de rendez-vous\n- Le désassigner de toutes ses études\n- Créer des annulations pour chaque étude\n- L'archiver\n\nCette action est irréversible.`;

    if (window.confirm(confirmMessage)) {
      return await cancelVolunteer(idVol, motifAnnulation);
    }

    return {
      success: false,
      cancelled: true,
      message: 'Annulation annulée par l\'utilisateur'
    };
  }, [cancelVolunteer]);

  /**
   * Confirme la suppression des créneaux avec l'utilisateur
   */
  const confirmAndRemoveFromSlots = useCallback(async (
    idVol: number,
    volunteerName: string,
    motif: string
  ): Promise<CancellationResult> => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer "${volunteerName}" de tous ses créneaux ?\n\nCela va libérer tous ses rendez-vous mais le garder actif dans le système.`;

    if (window.confirm(confirmMessage)) {
      return await removeFromSlots(idVol, motif);
    }

    return {
      success: false,
      cancelled: true,
      message: 'Suppression annulée par l\'utilisateur'
    };
  }, [removeFromSlots]);

  /**
   * Réinitialise l'état du hook
   */
  const reset = useCallback((): void => {
    setError(null);
    setLastResult(null);
    setIsLoading(false);
  }, []);

  return {
    // États
    isLoading,
    error,
    lastResult,

    // Actions principales
    cancelVolunteer,
    removeFromSlots,

    // Actions avec confirmation
    confirmAndCancelVolunteer,
    confirmAndRemoveFromSlots,

    // Utilitaires
    reset
  };
};

export default useVolunteerCancellation;
