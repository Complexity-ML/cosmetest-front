import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import etudeService from '../../services/etudeService';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import volontaireService from '../../services/volontaireService';
import groupeService from '../../services/groupeService';
import annulationService from '../../services/annulationService'; // NOUVEAU
import api from '../../services/api';
import { PAIEMENT_STATUS } from '../../hooks/usePaiements';
import ExcelExport from '../../components/Paiements/ExcelExport';
import StatsSummary from '../../components/Paiements/StatsSummary';
import MassActionsPanel from '../../components/Paiements/MassActionsPanel';
import FiltersPanel from '../../components/Paiements/FiltersPanel';
import PaiementService from '../../services/PaiementService';
import PaymentsTable from '../../components/Paiements/PaymentsTable';
import { Etude } from '../../types/types'; // Import Etude type

// Type definitions
interface Paiement {
  idEtude: number;
  idGroupe?: number | string;
  idVolontaire: number;
  iv: number;
  numsujet?: string;
  paye: number;
  statut?: number;
}

interface VolontaireInfo {
  idVolontaire: number | string;
  nom: string;
  prenom: string;
  [key: string]: any;
}

interface GroupeInfo {
  idGroupe: number | string;
  nom: string;
  [key: string]: any;
}

interface PaiementSummary {
  total: number;
  paye: number;
  nonPaye: number;
  enAttente: number;
  [key: string]: number;
}


const PaiementsPage = () => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);

  // Stats - TOUJOURS déclarer les hooks en premier
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [volontairesInfo, setVolontairesInfo] = useState<Record<string | number, VolontaireInfo>>({});
  const [groupesInfo, setGroupesInfo] = useState<Record<string, GroupeInfo>>({});
  const [annulationsInfo, setAnnulationsInfo] = useState<Record<string, boolean>>({}); // NOUVEAU : Cache des annulations
  const [paiementsSummaryByEtude, setPaiementsSummaryByEtude] = useState<Record<string | number, PaiementSummary>>({});
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [updateStatus, setUpdateStatus] = useState<Record<string, any>>({});
  const [allPaiementsLoaded, setAllPaiementsLoaded] = useState(false);
  const [isMassUpdating, setIsMassUpdating] = useState(false);

  // Filtres
  const [selectedEtude, setSelectedEtude] = useState('none');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [statutPaiement, setStatutPaiement] = useState('all');
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
  const [showAnnules, setShowAnnules] = useState(false); // NOUVEAU : Afficher/masquer les annulations
  const [showCompleted6WeeksUnpaid, setShowCompleted6WeeksUnpaid] = useState(false); // Filtre 6+ semaines avec impayés (limité à n-1 et n)

  // NOUVEAU : Fonction pour vérifier si un volontaire est annulé
  const isVolontaireAnnule = useCallback((idVolontaire: string | number, idEtude: string | number): boolean => {
    const key = `${idEtude}_${idVolontaire}`;
    return annulationsInfo[key] === true;
  }, [annulationsInfo]);

  // NOUVEAU : Charger les annulations pour une étude
  const loadAnnulationsInfo = useCallback(async (etudeId: string | number) => {
    try {
      const numericId = typeof etudeId === 'string' ? parseInt(etudeId, 10) : etudeId;
      const annulations = await annulationService.getByEtude(numericId);
      
      const annulationsData: Record<string, boolean> = {};
      annulations.forEach((annulation: any) => {
        const key = `${annulation.idEtude}_${annulation.idVol}`;
        annulationsData[key] = true;
      });

      setAnnulationsInfo(prev => ({
        ...prev,
        ...annulationsData
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des annulations:', error);
    }
  }, []);

  // Chargement des études
  useEffect(() => {
    const loadEtudes = async () => {
      try {
        const etudesData = await etudeService.getAll();
        setEtudes(Array.isArray(etudesData) ? etudesData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des études:', error);
        setError(t('payments.errorLoadingStudies'));
      }
    };
    loadEtudes();
  }, []);
  useEffect(() => {
    const loadPaiementSummaries = async () => {
      try {
        setIsSummaryLoading(true);
        setAllPaiementsLoaded(false);
        const summaries = await PaiementService.getPaiementsSummaryParEtude();
        const summaryMap: Record<string | number, any> = {};
        if (Array.isArray(summaries)) {
          summaries.forEach((item: any) => {
            if (item && item.idEtude != null) {
              summaryMap[item.idEtude] = {
                ...item,
                payes: item.payes ?? 0,
                nonPayes: item.nonPayes ?? 0,
                enAttente: item.enAttente ?? 0,
                annules: item.annules ?? 0,
              };
            }
          });
        }
        setPaiementsSummaryByEtude(summaryMap);
      } catch (error) {
        console.error('Erreur lors du chargement du résumé des paiements:', error);
      } finally {
        setAllPaiementsLoaded(true);
        setIsSummaryLoading(false);
      }
    };

    loadPaiementSummaries();
  }, []);


  // Filtrage et tri des études avec gestion du cache

  const hasStatutForEtude = useCallback((etudeId: string | number, statutRecherche: number): boolean => {
    const summary = paiementsSummaryByEtude[etudeId];
    if (!summary) {
      return false;
    }
    switch (statutRecherche) {
      case 0:
        return (summary.nonPayes ?? 0) > 0;
      case 1:
        return (summary.payes ?? 0) > 0;
      case 2:
        return (summary.enAttente ?? 0) > 0;
      case 3:
        return (summary.annules ?? 0) > 0;
      default:
        return false;
    }
  }, [paiementsSummaryByEtude]);

  const refreshSummaryForEtude = useCallback(async (etudeId: string | number) => {
    if (!etudeId) {
      return;
    }
    try {
      const numericId = typeof etudeId === 'string' ? parseInt(etudeId, 10) : etudeId;
      const refreshedSummary = await PaiementService.getPaiementsSummaryPourEtude(numericId);
      if (refreshedSummary) {
        setPaiementsSummaryByEtude(prev => ({
          ...prev,
          [etudeId]: {
            ...prev[etudeId],
            ...refreshedSummary,
            payes: refreshedSummary.payes ?? 0,
            nonPayes: refreshedSummary.nonPayes ?? 0,
            enAttente: refreshedSummary.enAttente ?? 0,
            annules: refreshedSummary.annules ?? 0,
          },
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du résumé de paiements:', error);
    }
  }, [setPaiementsSummaryByEtude]);


  const etudesFiltrees = useMemo(() => {
    let filtered = [...etudes];

    // Filtrage par études terminées il y a 6+ semaines avec des impayés
    // Limité aux études de l'année n-1 et n pour éviter d'afficher les vieilles études buggées
    if (showCompleted6WeeksUnpaid) {
      const sixWeeksAgo = new Date();
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42); // 6 semaines = 42 jours
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;

      filtered = filtered.filter(etude => {
        // Vérifier si l'étude a une date de fin et de début
        if (!etude.dateFin || !etude.dateDebut) return false;

        const dateFin = new Date(etude.dateFin);
        const dateDebut = new Date(etude.dateDebut);

        // Limiter aux études de l'année n-1 et n uniquement
        const anneeDebut = dateDebut.getFullYear();
        if (anneeDebut < previousYear) return false;

        // L'étude doit être terminée il y a 6+ semaines
        if (dateFin > sixWeeksAgo) return false;

        // Vérifier s'il y a des paiements non payés
        const summary = paiementsSummaryByEtude[etude.idEtude as string | number];
        if (!summary) return false;

        return (summary.nonPayes ?? 0) > 0;
      });
    }

    // Filtrage par dates si des dates sont sélectionnées
    if (dateDebut || dateFin) {
      filtered = filtered.filter(etude => {
        if (!etude.dateDebut) return false;

        const dateEtude = new Date(etude.dateDebut);

        if (dateDebut && dateEtude <= new Date(dateDebut)) return false;
        if (dateFin && dateEtude > new Date(dateFin)) return false;

        return true;
      });
    }

    // Filtrage par statut de paiement avec gestion spéciale pour "Non payé"
    if (statutPaiement !== 'all') {
      const statutRecherche = parseInt(statutPaiement, 10);

      if (Number.isInteger(statutRecherche)) {
        if (statutRecherche === 0) {
          filtered = filtered.filter(etude =>
            etude.paye === 0 || (etude.idEtude != null && hasStatutForEtude(etude.idEtude, statutRecherche))
          );
        } else if (statutRecherche === 2) {
          filtered = filtered.filter(etude =>
            etude.paye === 2 || (etude.idEtude != null && hasStatutForEtude(etude.idEtude, statutRecherche))
          );
        } else {
          filtered = filtered.filter(etude => etude.idEtude != null && hasStatutForEtude(etude.idEtude, statutRecherche));
        }
      }
    }

    // Tri en ordre descendant par date de début
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateDebut || '');
      const dateB = new Date(b.dateDebut || '');
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [etudes, dateDebut, dateFin, statutPaiement, hasStatutForEtude, showCompleted6WeeksUnpaid, paiementsSummaryByEtude]);

  // Reset de l'étude sélectionnée seulement si des filtres sont actifs ET l'étude n'est plus dans la liste filtrée
  useEffect(() => {
    if ((dateDebut || dateFin || statutPaiement !== 'all' || showCompleted6WeeksUnpaid) && selectedEtude !== 'none' && !etudesFiltrees.some(e => String(e.idEtude) === selectedEtude)) {
      setSelectedEtude('none');
    }
  }, [etudesFiltrees, selectedEtude, dateDebut, dateFin, statutPaiement, showCompleted6WeeksUnpaid]);

  // Fonction pour charger les informations des groupes
  const loadGroupesInfo = async (etudeIds: (string | number)[]) => {
    try {
      const groupesData: Record<string, any> = {};

      const results = await Promise.allSettled(
        etudeIds.map(async (etudeId: string | number) => {
          try {
            const groupes = await groupeService.getGroupesByIdEtude(etudeId);
            return { etudeId, groupes: Array.isArray(groupes) ? groupes : [] };
          } catch (error) {
            console.error(`Erreur groupes étude ${etudeId}:`, error);
            return { etudeId, groupes: [] };
          }
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.groupes) {
          const { etudeId, groupes } = result.value;

          groupes.forEach((groupe: any) => {
            groupesData[groupe.id || groupe.idGroupe] = groupe;
          });

          groupesData[`etude_${etudeId}`] = groupes;
        }
      });

      setGroupesInfo(groupesData);
    } catch (error) {
      console.error('Erreur lors du chargement des groupes:', error);
    }
  };

  // Fonction pour normaliser les données de paiements
  const normalizePaiementsData = (paiementsData: any[]) => {
    return paiementsData.map((paiement: any) => ({
      ...paiement,
      idGroupe: paiement.idGroupe ?? 0,
      iv: paiement.iv ?? 0,
      numsujet: paiement.numsujet ?? 0,
      paye: paiement.paye ?? 0,
      statut: paiement.statut || 'actif',
      key: `${paiement.idEtude}_${paiement.idVolontaire}`,
      isComplete: !!(paiement.idEtude && paiement.idVolontaire)
    }));
  };

  // Chargement des informations des volontaires
  const loadVolontairesInfo = useCallback(async (volontaireIds: (string | number)[]) => {
    try {
      const volontairesData: Record<string | number, any> = {};
      const results = await Promise.allSettled(
        volontaireIds.map(async (volontaireId: string | number) => {
          const response = await volontaireService.getDetails(volontaireId);
          return { id: volontaireId, data: response.data };
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value?.data) {
          volontairesData[result.value.id] = result.value.data;
        }
      });

      setVolontairesInfo(volontairesData);
    } catch (error) {
      console.error('Erreur lors du chargement des volontaires:', error);
    }
  }, []);

  // Chargement conditionnel des paiements
  const loadPaiements = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!selectedEtude || selectedEtude === 'none') {
        setPaiements([]);
        setVolontairesInfo({});
        setGroupesInfo({});
        setAnnulationsInfo({}); // NOUVEAU : Reset des annulations
        setIsLoading(false);
        return;
      }

      // 1. Charger les paiements de cette étude UNIQUEMENT
      const response = await etudeVolontaireService.getVolontairesByEtude(selectedEtude);
      const paiementsData = Array.isArray(response) ? response : response?.data || [];

      if (paiementsData.length === 0) {
        setPaiements([]);
        setVolontairesInfo({});
        setGroupesInfo({});
        setAnnulationsInfo({});
        setIsLoading(false);
        return;
      }

      // 2. Normaliser les données
      const normalizedPaiements = normalizePaiementsData(paiementsData);
      setPaiements(normalizedPaiements);

      // 3. NOUVEAU : Charger les annulations pour cette étude
      await loadAnnulationsInfo(selectedEtude);

      // 4. Charger les volontaires de cette étude UNIQUEMENT
      const uniqueVolontaireIds = [...new Set(normalizedPaiements.map((p: any) => p.idVolontaire).filter((id: any) => id))];
      if (uniqueVolontaireIds.length > 0) {
        await loadVolontairesInfo(uniqueVolontaireIds);
      }

      // 5. Charger les groupes de cette étude UNIQUEMENT
      await loadGroupesInfo([selectedEtude]);

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError(t('payments.errorLoadingData'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPaiements();
  }, [selectedEtude]);

  // MODIFIÉ : Mise à jour du statut de paiement avec vérification annulation
  const updatePaiementStatus = async (paiement: Paiement, nouveauStatut: number) => {
    // NOUVEAU : Vérifier si le volontaire est annulé
    if (isVolontaireAnnule(paiement.idVolontaire, paiement.idEtude)) {
      setError(t('payments.cannotModifyCancelled'));
      return;
    }

    const key = `${paiement.idEtude}_${paiement.idVolontaire}`;

    try {
      setUpdateStatus(prev => ({ ...prev, [key]: 'loading' }));

      await api.patch('/etude-volontaires/update-paye', null, {
        params: {
          idEtude: paiement.idEtude,
          idGroupe: paiement.idGroupe,
          idVolontaire: paiement.idVolontaire,
          iv: paiement.iv,
          numsujet: paiement.numsujet,
          paye: paiement.paye,
          statut: paiement.statut,
          nouveauPaye: nouveauStatut
        }
      });

      // Mise à jour locale
      const updatedPaiements = paiements.map(p =>
        p.idEtude === paiement.idEtude && p.idVolontaire === paiement.idVolontaire
          ? { ...p, paye: nouveauStatut }
          : p
      );
      setPaiements(updatedPaiements);

      const numericEtudeId = typeof paiement.idEtude === 'string' ? parseInt(paiement.idEtude, 10) : paiement.idEtude;
      await refreshSummaryForEtude(numericEtudeId);

      try {
        const newEtudePayeStatus = await etudeService.checkAndUpdatePayeStatus(
          numericEtudeId,
          updatedPaiements
        );

        setEtudes(prev => prev.map(e =>
          e.idEtude === paiement.idEtude
            ? { ...e, paye: newEtudePayeStatus }
            : e
        ));
      } catch (etudeError) {
        console.error('Erreur mise à jour statut étude:', etudeError);
      }

      setUpdateStatus(prev => ({ ...prev, [key]: 'success' }));

      setTimeout(() => {
        setUpdateStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[key];
          return newStatus;
        });
      }, 2000);

    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setUpdateStatus(prev => ({ ...prev, [key]: 'error' }));

      const errorMessage = error?.response?.data?.details ||
        error?.response?.data?.message ||
        error.message ||
        t('payments.errorUpdatingStatus');
      setError(errorMessage);

      setTimeout(() => {
        setUpdateStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[key];
          return newStatus;
        });
      }, 3000);
    }
  };

  // MODIFIÉ : Filtrage des paiements avec option d'affichage des annulés
  const paiementsFiltres = useMemo(() => {
    let filtered = paiements;

    // Filtrer selon l'affichage des annulés
    if (!showAnnules) {
      filtered = filtered.filter(p => !isVolontaireAnnule(p.idVolontaire, p.idEtude));
    }

    if (showOnlyUnpaid) {
      filtered = filtered.filter(p => p.paye === 0);
    }

    return filtered;
  }, [paiements, showOnlyUnpaid, showAnnules, isVolontaireAnnule]);

  // MODIFIÉ : Statistiques excluant les annulés par défaut
  const statistics = useMemo(() => {
    // Séparer les paiements actifs et annulés
    const paiementsActifs = paiementsFiltres.filter(p => !isVolontaireAnnule(p.idVolontaire, p.idEtude));
    const paiementsAnnules = paiements.filter(p => isVolontaireAnnule(p.idVolontaire, p.idEtude));

    const total = paiementsFiltres.length;
    const payes = paiementsActifs.filter(p => p.paye === 1).length;
    const nonPayes = paiementsActifs.filter(p => p.paye === 0).length;
    const enAttente = paiementsActifs.filter(p => p.paye === 2).length;
    const totalMontant = paiementsActifs.reduce((sum, p) => sum + (p.iv || 0), 0);
    const montantPaye = paiementsActifs.filter(p => p.paye === 1).reduce((sum, p) => sum + (p.iv || 0), 0);

    return {
      total,
      payes,
      nonPayes,
      enAttente,
      totalMontant,
      montantPaye,
      montantRestant: totalMontant - montantPaye,
      annulesCount: paiementsAnnules.length, // NOUVEAU
      montantAnnules: paiementsAnnules.reduce((sum, p) => sum + (p.iv || 0), 0) // NOUVEAU
    };
  }, [paiementsFiltres, paiements, isVolontaireAnnule]);

  // Fonctions utilitaires
  const getVolontaireName = (idVolontaire: string | number) => {
    const volontaire = volontairesInfo[idVolontaire];
    if (!volontaire) return `Volontaire #${idVolontaire}`;

    const prenom = volontaire.prenom || volontaire.prenomVol || '';
    const nom = volontaire.nom || volontaire.nomVol || '';

    if (prenom && nom) return `${prenom} ${nom}`;
    return volontaire.nomComplet || `Volontaire #${idVolontaire}`;
  };

  const getEtudeName = (idEtude: string | number) => {
    const etude = etudes.find(e => e.idEtude == idEtude);
    return etude ? etude.ref : `Étude #${idEtude}`;
  };

  const getGroupeName = (idGroupe: string | number, idEtude: string | number) => {
    const groupe = groupesInfo[idGroupe];
    if (groupe) {
      return groupe.nom || groupe.libelle || `Groupe ${idGroupe}`;
    }

    const groupesEtude = groupesInfo[`etude_${idEtude}`] || [];
    const groupeInEtude = groupesEtude.find((g: any) => g.id === idGroupe || g.idGroupe === idGroupe);

    if (groupeInEtude) {
      return groupeInEtude.nom || groupeInEtude.libelle || `Groupe ${idGroupe}`;
    }

    return `Groupe #${idGroupe}`;
  };

  // MODIFIÉ : Composant pour les actions en masse excluant les annulés

  const selectedEtudeData = useMemo(() => {
    return etudes.find(e => String(e.idEtude) === selectedEtude) || null;
  }, [etudes, selectedEtude]);
  // Nouveau endpoint backend: Marquer tout comme paye
  const markAllAsPaidBatch = async () => {
    if (!selectedEtudeData || !paiements || paiements.length === 0) return;

    const unpaidCount = paiements.filter(p => p.paye !== 1 && !isVolontaireAnnule(p.idVolontaire, p.idEtude)).length;
    const annulesCount = paiements.filter(p => isVolontaireAnnule(p.idVolontaire, p.idEtude)).length;
    if (unpaidCount === 0) { setError(t('payments.allPaid')); return; }

    let confirmMessage = t('payments.markAllPaidConfirm', { count: unpaidCount, ref: selectedEtudeData.ref });
    if (annulesCount > 0) confirmMessage += `\n\n${t('payments.cancelledWillBeIgnored', { count: annulesCount })}`;
    confirmMessage += `\n\n${t('payments.cannotBeUndone')}`;
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    setIsMassUpdating(true);
    setError('');
    try {
      if (selectedEtudeData.idEtude != null) {
        await api.post(`/paiements/etudes/${selectedEtudeData.idEtude}/mark-all-paid`);
        await loadPaiements();
        await refreshSummaryForEtude(selectedEtudeData.idEtude);
        // rafraichir le statut paye de l'etude
        try {
          const numericId = typeof selectedEtudeData.idEtude === 'string' ? parseInt(selectedEtudeData.idEtude, 10) : selectedEtudeData.idEtude;
          const etude = await etudeService.getById(numericId);
          setEtudes(prev => prev.map(e => e.idEtude === selectedEtudeData.idEtude ? { ...e, paye: etude.paye } : e));
        } catch (e) {}
      }
    } catch (error) {
      console.error('Erreur mark-all-paid:', error);
      setError(t('payments.errorMassUpdate'));
    } finally {
      setIsMassUpdating(false);
    }
  };

  // Vérification des permissions
  const canManagePaiements = useMemo(() => {
    if (!authContext) {
      return false;
    }

    const { isAuthenticated, user, isAdmin, hasPermission } = authContext;

    if (!isAuthenticated || !user) {
      return false;
    }

    let canAccess = false;

    if (typeof isAdmin === 'function') {
      canAccess = isAdmin();
    }

    if (!canAccess && typeof hasPermission === 'function') {
      canAccess = hasPermission(2);
    }

    if (!canAccess && (user.role === 1 || user.role === 2)) {
      canAccess = true;
    }

    return canAccess;
  }, [authContext]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!canManagePaiements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('common.accessDenied')}</h1>
          <p className="text-gray-600">{t('common.adminOnly')}</p>
          <div className="mt-4 space-x-3">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              {t('common.back')}
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              {t('sidebar.dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Wrapper function to handle type compatibility with PaymentsTable
  const handleUpdatePaiementStatus = (payment: any, status: number) => {
    updatePaiementStatus(payment as Paiement, status);
  };

  return (
    <div className="space-y-6">
      <StatsSummary statistics={statistics} />
      <FiltersPanel
        etudesFiltrees={etudesFiltrees.filter(e => e.idEtude != null) as Array<{ idEtude: string | number; ref: string; dateDebut?: string }>}
        selectedEtude={selectedEtude}
        setSelectedEtude={setSelectedEtude}
        statutPaiement={statutPaiement}
        setStatutPaiement={setStatutPaiement}
        dateDebut={dateDebut}
        setDateDebut={setDateDebut}
        dateFin={dateFin}
        setDateFin={setDateFin}
        showOnlyUnpaid={showOnlyUnpaid}
        setShowOnlyUnpaid={setShowOnlyUnpaid}
        showAnnules={showAnnules}
        setShowAnnules={setShowAnnules}
        showCompleted6WeeksUnpaid={showCompleted6WeeksUnpaid}
        setShowCompleted6WeeksUnpaid={setShowCompleted6WeeksUnpaid}
        allPaiementsLoaded={allPaiementsLoaded}
        paiementStatusMap={PAIEMENT_STATUS}
      />
      {/* En-tête avec indicateur de mode */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {t('payments.title')}
          </h1>
          {selectedEtude && (
            <div className="mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {t('payments.study')}: {getEtudeName(selectedEtude)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {statistics.total} {t('payments.payment', { count: statistics.total })}
          </span>
          {(dateDebut || dateFin || statutPaiement !== 'all' || showCompleted6WeeksUnpaid) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {t('payments.activeFilters')}: {etudesFiltrees.length} {t('payments.studyFiltered', { count: etudesFiltrees.length })}
              {(statutPaiement !== 'all' || showCompleted6WeeksUnpaid) && isSummaryLoading && (
                <span className="ml-1 animate-spin">⏳</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button
            onClick={() => setError('')}
            className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* MODIFIÉ : Statistiques avec info sur les annulés */}
      {/* Composant d'export Excel */}
      {selectedEtudeData && paiements.length > 0 && (
        <ExcelExport
          etude={selectedEtudeData}
          paiements={paiementsFiltres}
          volontairesInfo={volontairesInfo}
          getGroupeName={getGroupeName}
        />
      )}

      {/* Composant d'actions en masse */}
      <MassActionsPanel 
        selectedEtudeRef={selectedEtudeData?.ref || ''} 
        paiements={paiements} 
        isVolontaireAnnule={isVolontaireAnnule} 
        isMassUpdating={isMassUpdating} 
        statistics={statistics} 
        onMarkAll={markAllAsPaidBatch} 
      />

 
      {etudesFiltrees.length === 0 && (dateDebut || dateFin || statutPaiement !== 'all' || showCompleted6WeeksUnpaid) ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">(i)</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('payments.noMatchingStudy')}</h3>
            <p className="text-gray-500">{t('payments.noMatchingStudyDesc')}</p>
          </div>
        ) : (!selectedEtude || selectedEtude === 'none') ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">(i)</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('payments.selectStudy')}</h3>
            <p className="text-gray-500">{t('payments.selectStudyDesc')}</p>
          </div>
        ) : paiementsFiltres.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{t('payments.noPaymentsFound')}</p>
          </div>
        ) : (
          <PaymentsTable
            rows={paiementsFiltres}
            paiementStatusMap={PAIEMENT_STATUS}
            getEtudeName={getEtudeName}
            getVolontaireName={getVolontaireName}
            getGroupeName={getGroupeName}
            isVolontaireAnnule={isVolontaireAnnule}
            updatePaiementStatus={handleUpdatePaiementStatus}
            updateStatus={updateStatus}
          />
        )}
    </div>
  );
};

export default PaiementsPage;
