import { useState, useEffect, useCallback } from 'react';
import { NavigateFunction } from 'react-router-dom';

import api from '../../../services/api';
import etudeService from '../../../services/etudeService';
import rdvService from '../../../services/rdvService';
import groupeService from '../../../services/groupeService';
import { Etude } from '../../../types/types';

const ETHNIES_DISPONIBLES = [
  'CAUCASIENNE',
  'AFRICAINE',
  'ASIATIQUE',
  'INDIENNE',
  'ANTILLAISE',
] as const;

interface Rdv {
  id?: number;
  idRdv?: number;
  idEtude?: number;
  idVolontaire?: number;
  date?: string;
  heure?: string;
  etat?: string;
  volontaire?: any;
  prenomVolontaire?: string;
  nomVolontaire?: string;
  nomCompletVolontaire?: string;
  [key: string]: any;
}

interface NormalizedRdv extends Rdv {
  idEtude: number;
  idRdv: number;
  etude: {
    id?: number;
    ref: string;
    titre?: string;
  } | null;
}

interface NewGroupe {
  intitule?: string;
  description?: string;
  idEtude?: number;
  ageMinimum?: number;
  ageMaximum?: number;
  ethnie?: string | string[];
  criteresSupplementaires?: string;
  nbSujet?: number;
  iv?: number;
}

interface UseEtudeDetailParams {
  id: string | number;
  navigate: NavigateFunction;
}

interface UseEtudeDetailReturn {
  etude: Etude | null;
  rdvs: Rdv[];
  groupes: any[];
  isLoading: boolean;
  isLoadingRdvs: boolean;
  isLoadingGroupes: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  infosVolontaires: Record<number, string>;
  selectedRdv: NormalizedRdv | null;
  showRdvViewer: boolean;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  showEmailSender: boolean;
  showActionsMenu: boolean;
  setShowActionsMenu: (show: boolean) => void;
  showGroupeForm: boolean;
  setShowGroupeForm: (show: boolean) => void;
  newGroupe: NewGroupe;
  setNewGroupe: (groupe: NewGroupe | ((prev: NewGroupe) => NewGroupe)) => void;
  ethniesDisponibles: readonly string[];
  handleRdvClick: (rdv: Rdv) => void;
  handleBackToRdvList: () => void;
  handleRdvUpdate: () => void;
  handleIndemniteError: (errorMessage: string) => void;
  getUniqueVolunteerIds: () => number[];
  handleDelete: () => Promise<void>;
  handleSort: (field: string) => void;
  sortedRdvs: () => Rdv[];
  getNomVolontaire: (rdv: Rdv) => string;
  handleOpenEmailSender: () => void;
  handleCloseEmailSender: () => void;
  handleGroupeChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleEthnieChange: (ethnieValue: string) => void;
  handleCreateGroupe: (event: React.FormEvent) => Promise<void>;
  fetchRdvs: () => Promise<void>;
  fetchGroupes: () => Promise<void>;
}

const normalizeEthnies = (ethniesArray: string | string[] | undefined): string => {
  if (!ethniesArray) return '';
  return Array.isArray(ethniesArray) ? ethniesArray.join(',') : ethniesArray;
};

export const useEtudeDetail = ({ id, navigate }: UseEtudeDetailParams): UseEtudeDetailReturn => {
  const [etude, setEtude] = useState<Etude | null>(null);
  const [rdvs, setRdvs] = useState<Rdv[]>([]);
  const [groupes, setGroupes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRdvs, setIsLoadingRdvs] = useState(true);
  const [isLoadingGroupes, setIsLoadingGroupes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  const [infosVolontaires, setInfosVolontaires] = useState<Record<number, string>>({});
  const [selectedRdv, setSelectedRdv] = useState<NormalizedRdv | null>(null);
  const [showRdvViewer, setShowRdvViewer] = useState(false);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showEmailSender, setShowEmailSender] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showGroupeForm, setShowGroupeForm] = useState(false);
  const [newGroupe, setNewGroupe] = useState<NewGroupe>({
    intitule: '',
    description: '',
    idEtude: typeof id === 'string' ? Number(id) : id,
    ageMinimum: undefined,
    ageMaximum: undefined,
    ethnie: [],
    criteresSupplementaires: '',
    nbSujet: undefined,
    iv: undefined,
  });

  const fetchEtude = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await etudeService.getById(Number(id));
      setEtude(data);
    } catch (fetchError) {
      console.error("Erreur lors du chargement de l'étude:", fetchError);
      setError("Impossible de charger les détails de l'étude");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchRdvs = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingRdvs(true);
      const data = await rdvService.getByEtudeId(Number(id));
      setRdvs(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error('Erreur lors du chargement des rendez-vous:', fetchError);
      setRdvs([]);
    } finally {
      setIsLoadingRdvs(false);
    }
  }, [id]);

  const fetchGroupes = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingGroupes(true);
      const data = await groupeService.getGroupesByIdEtude(id);
      setGroupes(Array.isArray(data) ? data : []);
    } catch (fetchError) {
      console.error('Erreur lors du chargement des groupes:', fetchError);
      setGroupes([]);
    } finally {
      setIsLoadingGroupes(false);
    }
  }, [id]);

  const handleRdvClick = useCallback(
    (rdv: Rdv) => {
      const normalizedRdv: NormalizedRdv = {
        ...rdv,
        idEtude: rdv.idEtude || Number(id),
        idRdv: rdv.idRdv || rdv.id || 0,
        etude: etude
          ? {
              id: etude.idEtude,
              ref: etude.ref,
              titre: etude.titre,
            }
          : null,
      };

      setSelectedRdv(normalizedRdv);
      setShowRdvViewer(true);
    },
    [etude, id]
  );

  const handleBackToRdvList = useCallback(() => {
    setShowRdvViewer(false);
    setSelectedRdv(null);
  }, []);

  const handleRdvUpdate = useCallback(() => {
    fetchRdvs();
    setShowRdvViewer(false);
    setSelectedRdv(null);
  }, [fetchRdvs]);

  const handleIndemniteError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const getUniqueVolunteerIds = useCallback((): number[] => {
    return [
      ...new Set(
        (rdvs || [])
          .map((rdv) => rdv.idVolontaire)
          .filter((volontaireId): volontaireId is number => Boolean(volontaireId))
      ),
    ];
  }, [rdvs]);

  const handleDelete = useCallback(async () => {
    if (!id) return;

    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette étude ?")) {
      try {
        await etudeService.delete(Number(id));
        navigate('/etudes');
      } catch (deleteError) {
        console.error('Erreur lors de la suppression:', deleteError);
        alert("Une erreur est survenue lors de la suppression de l'étude");
      }
    }
  }, [id, navigate]);

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDirection('asc');
      }
    },
    [sortField]
  );

  const chargerInfosVolontaire = useCallback(
    async (idVolontaire: number) => {
      if (!idVolontaire || infosVolontaires[idVolontaire]) return;

      try {
        const response = await api.get(`/volontaires/${idVolontaire}`);
        if (response.data) {
          const volontaire = response.data;
          const nomAffiche =
            volontaire.prenom && volontaire.nom
              ? `${volontaire.prenom} ${volontaire.nom}`.trim()
              : volontaire.nomComplet || `Volontaire #${idVolontaire}`;

          setInfosVolontaires((prev) => ({
            ...prev,
            [idVolontaire]: nomAffiche,
          }));
        }
      } catch (fetchError) {
        console.error(
          `Erreur lors de la récupération des infos du volontaire ${idVolontaire}:`,
          fetchError
        );
      }
    },
    [infosVolontaires]
  );

  const getNomVolontaire = useCallback(
    (rdv: Rdv): string => {
      if (rdv.idVolontaire && infosVolontaires[rdv.idVolontaire]) {
        return infosVolontaires[rdv.idVolontaire];
      }

      if (rdv.volontaire) {
        if (typeof rdv.volontaire === 'object') {
          const prenom = rdv.volontaire.prenom || rdv.volontaire.prenomVolontaire || '';
          const nom = rdv.volontaire.nom || rdv.volontaire.nomVolontaire || '';

          if (prenom || nom) {
            return `${prenom} ${nom}`.trim();
          }
          if (rdv.volontaire.nomComplet) {
            return rdv.volontaire.nomComplet;
          }
        } else if (typeof rdv.volontaire === 'string') {
          return rdv.volontaire;
        }
      }

      if (rdv.prenomVolontaire && rdv.nomVolontaire) {
        return `${rdv.prenomVolontaire} ${rdv.nomVolontaire}`;
      }
      if (rdv.nomCompletVolontaire) {
        return rdv.nomCompletVolontaire;
      }

      if (rdv.idVolontaire) {
        chargerInfosVolontaire(rdv.idVolontaire);
        return `Volontaire #${rdv.idVolontaire}`;
      }

      return 'Non assigné';
    },
    [chargerInfosVolontaire, infosVolontaires]
  );

  const sortedRdvs = useCallback((): Rdv[] => {
    if (!rdvs || rdvs.length === 0) return [];

    return [...rdvs].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'date':
          comparison = new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
          break;
        case 'heure':
          comparison = (a.heure || '').localeCompare(b.heure || '');
          break;
        case 'volontaire': {
          const volontaireA = getNomVolontaire(a);
          const volontaireB = getNomVolontaire(b);
          comparison = volontaireA.localeCompare(volontaireB);
          break;
        }
        case 'etat':
          comparison = (a.etat || '').localeCompare(b.etat || '');
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [getNomVolontaire, rdvs, sortDirection, sortField]);

  const handleOpenEmailSender = useCallback(() => {
    setShowEmailSender(true);
    setShowActionsMenu(false);
  }, []);

  const handleCloseEmailSender = useCallback(() => {
    setShowEmailSender(false);
  }, []);

  const handleGroupeChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;

    if (['ageMinimum', 'ageMaximum', 'nbSujet', 'iv'].includes(name)) {
      setNewGroupe((prev) => ({
        ...prev,
        [name]: value === '' ? '' : Number(value),
      }));
    } else {
      setNewGroupe((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const handleEthnieChange = useCallback((ethnieValue: string) => {
    setNewGroupe((prevGroupe) => {
      const currentEthnies = Array.isArray(prevGroupe.ethnie) ? prevGroupe.ethnie : [];

      if (currentEthnies.includes(ethnieValue)) {
        return {
          ...prevGroupe,
          ethnie: currentEthnies.filter((ethnie) => ethnie !== ethnieValue),
        };
      }

      return {
        ...prevGroupe,
        ethnie: [...currentEthnies, ethnieValue],
      };
    });
  }, []);

  const handleCreateGroupe = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      if (!newGroupe.intitule) {
        setError("L'intitulé du groupe est requis");
        return;
      }

      try {
        const dataToSend = {
          ...newGroupe,
          idEtude: Number(id),
          ethnie: normalizeEthnies(newGroupe.ethnie),
        };

        await groupeService.create(dataToSend);
        await fetchGroupes();

        setNewGroupe({
          intitule: '',
          description: '',
          idEtude: Number(id),
          ageMinimum: undefined,
          ageMaximum: undefined,
          ethnie: [],
          criteresSupplementaires: '',
          nbSujet: undefined,
          iv: undefined,
        });

        setShowGroupeForm(false);
      } catch (createError) {
        console.error('Erreur lors de la création du groupe:', createError);
        setError('Erreur lors de la création du groupe');
      }
    },
    [fetchGroupes, id, newGroupe]
  );

  useEffect(() => {
    fetchEtude();
  }, [fetchEtude]);

  useEffect(() => {
    if (activeTab === 'rdvs') {
      fetchRdvs();
    }
  }, [activeTab, fetchRdvs]);

  useEffect(() => {
    if (activeTab === 'groupes') {
      fetchGroupes();
    }
  }, [activeTab, fetchGroupes]);

  useEffect(() => {
    if (!rdvs || rdvs.length === 0) return;

    const idsVolontaires = [
      ...new Set(
        rdvs
          .map((rdv) => rdv.idVolontaire)
          .filter((volontaireId): volontaireId is number => 
            Boolean(volontaireId) && !infosVolontaires[volontaireId as number]
          )
      ),
    ];

    idsVolontaires.forEach((volontaireId) => {
      chargerInfosVolontaire(volontaireId);
    });
  }, [rdvs, infosVolontaires, chargerInfosVolontaire]);

  return {
    etude,
    rdvs,
    groupes,
    isLoading,
    isLoadingRdvs,
    isLoadingGroupes,
    error,
    setError,
    activeTab,
    setActiveTab,
    infosVolontaires,
    selectedRdv,
    showRdvViewer,
    sortField,
    sortDirection,
    showEmailSender,
    showActionsMenu,
    setShowActionsMenu,
    showGroupeForm,
    setShowGroupeForm,
    newGroupe,
    setNewGroupe,
    ethniesDisponibles: ETHNIES_DISPONIBLES,
    handleRdvClick,
    handleBackToRdvList,
    handleRdvUpdate,
    handleIndemniteError,
    getUniqueVolunteerIds,
    handleDelete,
    handleSort,
    sortedRdvs,
    getNomVolontaire,
    handleOpenEmailSender,
    handleCloseEmailSender,
    handleGroupeChange,
    handleEthnieChange,
    handleCreateGroupe,
    fetchRdvs,
    fetchGroupes,
  };
};
