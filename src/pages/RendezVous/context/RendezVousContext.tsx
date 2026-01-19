import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import etudeService from '../../../services/etudeService';
import { VolontaireTransformed } from '../../../types/volontaire.types';

interface Study {
  id: number;
  ref: string;
  titre: string;
  dateDebut: string;
  dateFin: string;
  groups: any[];
}

interface RendezVousContextType {
  volunteers: (VolontaireTransformed | null)[];
  studies: Study[];
  isLoading: boolean;
  error: any;
  refresh: () => Promise<void>;
  requestRefresh: () => void;
}

const RendezVousContext = createContext<RendezVousContextType | null>(null);

const formatStudies = (studiesResponse: any): Study[] => {
  const studiesData = studiesResponse?.data || studiesResponse || [];

  if (!Array.isArray(studiesData)) {
    return [];
  }

  return studiesData.map((study) => ({
    id: study.idEtude || study.id,
    ref: study.ref,
    titre: study.titre,
    dateDebut: study.dateDebut,
    dateFin: study.dateFin,
    groups: study.groups || [],
  }));
};

interface RendezVousProviderProps {
  children: React.ReactNode;
}

export const RendezVousProvider = ({ children }: RendezVousProviderProps) => {
  const [volunteers, setVolunteers] = useState<(VolontaireTransformed | null)[]>([]);
  const [studies, setStudies] = useState<Study[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Fonction stable avec useCallback pour éviter les re-renders
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Ne charger QUE les études, pas les volontaires (trop lourd)
      const studiesResponse = await etudeService.getAll().catch((studyError) => {
        console.error('Erreur lors du chargement des études:', studyError);
        return [];
      });

      // Volontaires vides - chaque composant les chargera à la demande
      setVolunteers([]);

      const studiesData = formatStudies(studiesResponse);
      setStudies(studiesData);
    } catch (err) {
      console.error('Erreur lors du rafraîchissement des données rendez-vous:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []); // Aucune dépendance = fonction stable

  // UN SEUL useEffect - chargement initial uniquement
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Tableau vide = exécution une seule fois au montage

  // Pour forcer un rechargement explicite
  const requestRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      volunteers,
      studies,
      isLoading,
      error,
      refresh,
      requestRefresh,
    }),
    [volunteers, studies, isLoading, error] // Enlever refresh et requestRefresh car ils sont stables avec useCallback
  );

  return (
    <RendezVousContext.Provider value={value}>
      {children}
    </RendezVousContext.Provider>
  );
};

export const useRendezVousContext = () => {
  const context = useContext(RendezVousContext);
  if (!context) {
    throw new Error('useRendezVousContext must be used within a RendezVousProvider');
  }
  return context;
};

export default RendezVousContext;









