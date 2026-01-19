import { useState, useEffect, useCallback, useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';

import volontaireService from '../../../services/volontaireService';
import rdvService from '../../../services/rdvService';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import photoService from '../../../services/photoService';
import infoBancaireService from '../../../services/infoBancaireService';
import annulationService from '../../../services/annulationService';
import etudeService from '../../../services/etudeService';

interface UseVolontaireDetailsParams {
  id: string;
  navigate: NavigateFunction;
}

interface VolontaireData {
  nomVol?: string;
  prenomVol?: string;
  emailVol?: string;
  [key: string]: any;
}

interface InfoBankData {
  iban: string;
  bic: string;
}

interface Photo {
  url: string;
  nom: string;
  alt?: string;
  isPdf?: boolean;
}

interface AnnulationEtude {
  idEtude: number;
  dateAnnulation: string;
  referenceEtude: string;
  nomEtude: string;
  dateEtude: string | null;
  typeEtude: string | null;
  motif?: string;
  commentaire?: string;
  annulePar?: 'COSMETEST' | 'VOLONTAIRE' | string;
  [key: string]: any;
}

// Type pour les onglets disponibles
type TabKey = 'info' | 'caracteristiques' | 'peau' | 'cheveux' | 'cils' | 'marques' | 'problemes' | 'medical' | 'mesures' | 'rib' | 'evaluation' | 'notes' | 'rdvs' | 'etudes' | 'assignation' | 'photos';

interface UseVolontaireDetailsReturn {
  volontaire: VolontaireData | null;
  detailsData: any;
  volontaireDisplayData: any;
  infoBankData: InfoBankData;
  rdvs: any[];
  etudesCount: number;
  isLoading: boolean;
  error: string | null;
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  annulationsEtudes: AnnulationEtude[];
  showAllAnnulations: boolean;
  setShowAllAnnulations: (show: boolean) => void;
  photos: Photo[];
  isUploadingPhoto: boolean;
  photoUploadError: string | null;
  selectedPhoto: Photo | null;
  setSelectedPhoto: (photo: Photo | null) => void;
  handlePhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleAssignmentComplete: () => Promise<void>;
  handleDelete: () => Promise<void>;
  handleArchive: () => Promise<void>;
  handleUnarchive: () => Promise<void>;
}

export const useVolontaireDetails = ({ id, navigate }: UseVolontaireDetailsParams): UseVolontaireDetailsReturn => {
  const [volontaire, setVolontaire] = useState<VolontaireData | null>(null);
  const [detailsData, setDetailsData] = useState<any>(null);
  const [infoBankData, setInfoBankData] = useState<InfoBankData>({ iban: '', bic: '' });
  const [rdvs, setRdvs] = useState<any[]>([]);
  const [etudesCount, setEtudesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [annulationsEtudes, setAnnulationsEtudes] = useState<AnnulationEtude[]>([]);
  const [showAllAnnulations, setShowAllAnnulations] = useState<boolean>(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const fetchAnnulationsEtudes = useCallback(async (volontaireId: string | number) => {
    if (!volontaireId) {
      setAnnulationsEtudes([]);
      return;
    }

    try {
      const annulations = await annulationService.getByVolontaire(Number(volontaireId));

      if (!Array.isArray(annulations)) {
        setAnnulationsEtudes([]);
        return;
      }

      const enrichedAnnulations = await Promise.all(
        annulations.map(async (annulation: any) => {
          try {
            const etude = await etudeService.getById(annulation.idEtude);

            // Log pour déboguer le format de date
            console.log('Date annulation brute:', annulation.dateAnnulation, 'Type:', typeof annulation.dateAnnulation);

            return {
              ...annulation,
              referenceEtude: etude?.reference || etude?.ref || `REF-${annulation.idEtude}`,
              nomEtude: etude?.nom || etude?.titre || 'étude inconnue',
              dateEtude: etude?.dateDebut || etude?.date,
              typeEtude: etude?.type,
              motif: annulation.commentaire || annulation.motif,
              annulePar: annulation.annulePar,
            };
          } catch (fetchError) {
            console.warn(`Impossible de récupérer l'étude ${annulation.idEtude}:`, fetchError);
            return {
              ...annulation,
              referenceEtude: `REF-${annulation.idEtude}`,
              nomEtude: 'étude inconnue',
              dateEtude: null,
              typeEtude: null,
              motif: annulation.commentaire || annulation.motif,
              annulePar: annulation.annulePar,
            };
          }
        })
      );

      enrichedAnnulations.sort((a, b) => new Date(b.dateAnnulation).getTime() - new Date(a.dateAnnulation).getTime());
      setAnnulationsEtudes(enrichedAnnulations);
    } catch (fetchError) {
      console.warn("Erreur lors du chargement des annulations d'études:", fetchError);
      setAnnulationsEtudes([]);
    }
  }, []);

  const fetchPhotos = useCallback(async (vol: VolontaireData | null) => {
    if (!vol || !vol.nomVol) {
      setPhotos([]);
      return;
    }

    try {
      const result = await photoService.checkVolontairePhoto(vol.nomVol);
      if (result.exists && result.url) {
        setPhotos([
          {
            url: result.url,
            nom: `f_${vol.nomVol.toLowerCase().replace(/\s+/g, '_')}.jpg`,
          },
        ]);
      } else {
        setPhotos([]);
      }
    } catch (fetchError) {
      console.error('Erreur lors du chargement des photos:', fetchError);
    }
  }, []);

  const handlePhotoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setIsUploadingPhoto(true);
    setPhotoUploadError(null);

    try {
      const result = await photoService.uploadVolontairePhoto(id, file);
      if (result.success) {
        await fetchPhotos(volontaire);
      } else {
        setPhotoUploadError(result.message || "échec de l'envoi de la photo");
      }
    } catch (uploadError) {
      console.error("Erreur lors du téléchargement de la photo:", uploadError);
      setPhotoUploadError("Une erreur est survenue lors du téléchargement");
    } finally {
      setIsUploadingPhoto(false);
    }
  }, [fetchPhotos, id, volontaire]);

  const handleAssignmentComplete = useCallback(async () => {
    if (!id) return;

    try {
      const numericId = parseInt(id, 10);

      // Récupérer les RDV à venir
      const rdvsData = await rdvService.getByVolontaire(numericId);
      const upcomingRdvs = Array.isArray(rdvsData) ? rdvsData : [];

      // Récupérer aussi les RDV passés des 8 dernières semaines
      const today = new Date();
      const eightWeeksAgo = new Date(today);
      eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

      let pastRdvs: any[] = [];
      try {
        const pastRdvsResponse = await rdvService.search(
          { idVolontaire: numericId },
          0,
          100,
          'date,desc'
        );
        const allRdvs = pastRdvsResponse.content || [];
        pastRdvs = allRdvs.filter((rdv: any) => {
          const rdvDate = new Date(rdv.date);
          rdvDate.setHours(0, 0, 0, 0);
          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);
          return rdvDate < todayDate && rdvDate >= eightWeeksAgo;
        });
      } catch (pastError) {
        console.warn('Erreur lors du chargement des RDV passés:', pastError);
      }

      // Fusionner les RDV à venir et passés (en évitant les doublons)
      const allRdvsMap = new Map();
      [...upcomingRdvs, ...pastRdvs].forEach(rdv => {
        const key = `${rdv.idEtude}-${rdv.idRdv}`;
        if (!allRdvsMap.has(key)) {
          allRdvsMap.set(key, rdv);
        }
      });

      setRdvs(Array.from(allRdvsMap.values()));

      const etudesResponse = await etudeVolontaireService.getEtudesByVolontaire(id);
      setEtudesCount((etudesResponse.data || []).length);

      await fetchAnnulationsEtudes(id);
    } catch (refreshError) {
      console.warn('Erreur lors du rechargement des données:', refreshError);
    }
  }, [fetchAnnulationsEtudes, id]);

  const handleDelete = useCallback(async () => {
    if (!id) return;

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce volontaire ? Cette action est irréversible.')) {
      try {
        await volontaireService.delete(id);
        navigate('/volontaires');
      } catch (deleteError) {
        console.error('Erreur lors de la suppression du volontaire:', deleteError);
        alert('Une erreur est survenue lors de la suppression du volontaire');
      }
    }
  }, [id, navigate]);

  const reloadVolontaire = useCallback(async () => {
    if (!id) return;
    const response = await volontaireService.getById(id);
    setVolontaire(response.data);
  }, [id]);

  const handleArchive = useCallback(async () => {
    if (!id) return;

    if (window.confirm('Êtes-vous sûr de vouloir archiver ce volontaire ?')) {
      try {
        await volontaireService.archive(id);
        await reloadVolontaire();
      } catch (archiveError) {
        console.error("Erreur lors de l'archivage du volontaire:", archiveError);
        alert("Une erreur est survenue lors de l'archivage du volontaire");
      }
    }
  }, [id, reloadVolontaire]);

  const handleUnarchive = useCallback(async () => {
    if (!id) return;

    if (window.confirm('Êtes-vous sûr de vouloir désarchiver ce volontaire ?')) {
      try {
        await volontaireService.unarchive(id);
        await reloadVolontaire();
      } catch (unarchiveError) {
        console.error("Erreur lors du désarchivage du volontaire:", unarchiveError);
        alert("Une erreur est survenue lors du désarchivage du volontaire");
      }
    }
  }, [id, reloadVolontaire]);

  useEffect(() => {
    if (!volontaire) return;
    fetchPhotos(volontaire);
  }, [fetchPhotos, volontaire]);

  useEffect(() => {
    if (!id) {
      console.error('Aucun ID fourni pour le volontaire');
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const volontaireResponse = await volontaireService.getById(id);
        setVolontaire(volontaireResponse.data);

        try {
          const detailsResponse = await volontaireService.getDetails(id);
          setDetailsData(detailsResponse.data);
        } catch (detailsError) {
          console.warn('Erreur lors du chargement des détails du volontaire:', detailsError);
        }

        const numericId = parseInt(id, 10);

        try {
          // Récupérer les RDV à venir
          const rdvsData = await rdvService.getByVolontaire(numericId);
          const upcomingRdvs = Array.isArray(rdvsData) ? rdvsData : [];

          // Récupérer aussi les RDV passés des 8 dernières semaines
          const today = new Date();
          const eightWeeksAgo = new Date(today);
          eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

          let pastRdvs: any[] = [];
          try {
            const pastRdvsResponse = await rdvService.search(
              { idVolontaire: numericId },
              0,
              100,
              'date,desc'
            );
            // Filtrer pour ne garder que les RDV passés (date < aujourd'hui)
            const allRdvs = pastRdvsResponse.content || [];
            pastRdvs = allRdvs.filter((rdv: any) => {
              const rdvDate = new Date(rdv.date);
              rdvDate.setHours(0, 0, 0, 0);
              const todayDate = new Date();
              todayDate.setHours(0, 0, 0, 0);
              return rdvDate < todayDate && rdvDate >= eightWeeksAgo;
            });
          } catch (pastError) {
            console.warn('Erreur lors du chargement des RDV passés:', pastError);
          }

          // Fusionner les RDV à venir et passés (en évitant les doublons)
          const allRdvsMap = new Map();
          [...upcomingRdvs, ...pastRdvs].forEach(rdv => {
            const key = `${rdv.idEtude}-${rdv.idRdv}`;
            if (!allRdvsMap.has(key)) {
              allRdvsMap.set(key, rdv);
            }
          });

          setRdvs(Array.from(allRdvsMap.values()));
        } catch (rdvsError) {
          console.warn('Erreur lors du chargement des rendez-vous du volontaire:', rdvsError);
          setRdvs([]);
        }

        try {
          const etudesResponse = await etudeVolontaireService.getEtudesByVolontaire(id);
          setEtudesCount((etudesResponse.data || []).length);
          await fetchAnnulationsEtudes(id);
        } catch (etudesError) {
          console.warn('Erreur lors du comptage des études:', etudesError);
        }

        try {
          const infoBankResponse = await infoBancaireService.getByVolontaireId(numericId);
          if (infoBankResponse.data && infoBankResponse.data.length > 0) {
            const bankInfo = infoBankResponse.data[0];
            setInfoBankData({
              iban: bankInfo.iban || '',
              bic: bankInfo.bic || '',
            });
          } else {
            setInfoBankData({ iban: '', bic: '' });
          }
        } catch (infoBankError) {
          console.warn("Erreur lors du chargement de l'InfoBank du volontaire:", infoBankError);
          setInfoBankData({ iban: '', bic: '' });
        }
      } catch (fetchError) {
        console.error('Erreur lors du chargement des données du volontaire:', fetchError);
        setError('Impossible de charger les informations du volontaire');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchAnnulationsEtudes, id]);

  const volontaireDisplayData = useMemo(
    () => ({ ...(volontaire || {}), ...(detailsData || {}) }),
    [detailsData, volontaire]
  );

  return {
    volontaire,
    detailsData,
    volontaireDisplayData,
    infoBankData,
    rdvs,
    etudesCount,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    annulationsEtudes,
    showAllAnnulations,
    setShowAllAnnulations,
    photos,
    isUploadingPhoto,
    photoUploadError,
    selectedPhoto,
    setSelectedPhoto,
    handlePhotoUpload,
    handleAssignmentComplete,
    handleDelete,
    handleArchive,
    handleUnarchive,
  };
};

export default useVolontaireDetails;
