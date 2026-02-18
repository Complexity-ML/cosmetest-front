import { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../../context/AuthContext';
import etudeService from '../../services/etudeService';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import volontaireService from '../../services/volontaireService';
import groupeService from '../../services/groupeService';
import annulationService from '../../services/annulationService';
import api from '../../services/api';
import { PAIEMENT_STATUS } from '../../hooks/usePaiements';
import ExcelExport from '../../components/Paiements/ExcelExport';
import StatsSummary from '../../components/Paiements/StatsSummary';
import MassActionsPanel from '../../components/Paiements/MassActionsPanel';
import FiltersPanel from '../../components/Paiements/FiltersPanel';
import PaiementService from '../../services/PaiementService';
import PaymentsTable from '../../components/Paiements/PaymentsTable';
import { Etude } from '../../types/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
  payes: number;
  nonPayes: number;
  enAttente: number;
  annules: number;
  montantTotal: number;
  montantPaye: number;
  [key: string]: number;
}

const PaiementsPage = () => {
  const { t } = useTranslation();
  const authContext = useContext(AuthContext);

  // State global
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [paiementsSummaryByEtude, setPaiementsSummaryByEtude] = useState<Record<string | number, PaiementSummary>>({});
  const [allPaiementsLoaded, setAllPaiementsLoaded] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres (niveau liste)
  const [searchQuery, setSearchQuery] = useState('');
  const [statutPaiement, setStatutPaiement] = useState('all');

  // Vue détail
  const [selectedEtudeId, setSelectedEtudeId] = useState<number | null>(null);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [volontairesInfo, setVolontairesInfo] = useState<Record<string | number, VolontaireInfo>>({});
  const [groupesInfo, setGroupesInfo] = useState<Record<string, GroupeInfo>>({});
  const [annulationsInfo, setAnnulationsInfo] = useState<Record<string, boolean>>({});
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<Record<string, any>>({});
  const [isMassUpdating, setIsMassUpdating] = useState(false);
  const [showOnlyUnpaid, setShowOnlyUnpaid] = useState(false);
  const [showAnnules, setShowAnnules] = useState(false);

  // Vérifier si un volontaire est annulé
  const isVolontaireAnnule = useCallback((idVolontaire: string | number, idEtude: string | number): boolean => {
    const key = `${idEtude}_${idVolontaire}`;
    return annulationsInfo[key] === true;
  }, [annulationsInfo]);

  // Charger les annulations pour une étude
  const loadAnnulationsInfo = useCallback(async (etudeId: number) => {
    try {
      const annulations = await annulationService.getByEtude(etudeId);
      const annulationsData: Record<string, boolean> = {};
      annulations.forEach((annulation: any) => {
        const key = `${annulation.idEtude}_${annulation.idVol}`;
        annulationsData[key] = true;
      });
      setAnnulationsInfo(prev => ({ ...prev, ...annulationsData }));
    } catch (error) {
      console.error('Erreur lors du chargement des annulations:', error);
    }
  }, []);

  // Chargement initial des études
  useEffect(() => {
    const loadEtudes = async () => {
      try {
        const etudesData = await etudeService.getAll();
        setEtudes(Array.isArray(etudesData) ? etudesData : []);
      } catch (error) {
        console.error('Erreur lors du chargement des études:', error);
        setError(t('payments.errorLoadingStudies'));
      } finally {
        setIsLoading(false);
      }
    };
    loadEtudes();
  }, []);

  // Chargement des résumés de paiements par étude
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

  const refreshSummaryForEtude = useCallback(async (etudeId: string | number) => {
    if (!etudeId) return;
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
  }, []);

  // Vérifier si une étude a un certain statut de paiement
  const hasStatutForEtude = useCallback((etudeId: string | number, statutRecherche: number): boolean => {
    const summary = paiementsSummaryByEtude[etudeId];
    if (!summary) return false;
    switch (statutRecherche) {
      case 0: return (summary.nonPayes ?? 0) > 0;
      case 1: return (summary.payes ?? 0) > 0;
      case 2: return (summary.enAttente ?? 0) > 0;
      case 3: return (summary.annules ?? 0) > 0;
      default: return false;
    }
  }, [paiementsSummaryByEtude]);

  // ===== NIVEAU 1 : LISTE DES ÉTUDES =====

  const etudesFiltrees = useMemo(() => {
    let filtered = [...etudes];

    // Recherche par ID ou référence
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter(etude => {
        const ref = (etude.ref || '').toLowerCase();
        const id = String(etude.idEtude || '').toLowerCase();
        return ref.includes(query) || id.includes(query);
      });
    }

    // Filtrage par statut de paiement
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

    // Tri par date de fin décroissante (plus récente en haut)
    filtered.sort((a, b) => {
      const dateA = new Date(a.dateFin || a.dateDebut || '');
      const dateB = new Date(b.dateFin || b.dateDebut || '');
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [etudes, searchQuery, statutPaiement, hasStatutForEtude]);

  // Vérifier si une étude est > 6 semaines avec des impayés (pas rouge si statut payé)
  const isEtudeOverdue = useCallback((etude: Etude): boolean => {
    if (etude.paye === 2) return false; // Étude payée = pas de surbrillance rouge
    if (!etude.dateFin) return false;
    const dateFin = new Date(etude.dateFin);
    const sixWeeksAgo = new Date();
    sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42);
    if (dateFin > sixWeeksAgo) return false;
    const summary = paiementsSummaryByEtude[etude.idEtude as string | number];
    if (!summary) return false;
    return (summary.nonPayes ?? 0) > 0;
  }, [paiementsSummaryByEtude]);

  // ===== NIVEAU 2 : DÉTAIL D'UNE ÉTUDE =====

  const selectedEtudeData = useMemo(() => {
    if (selectedEtudeId === null) return null;
    return etudes.find(e => e.idEtude === selectedEtudeId) || null;
  }, [etudes, selectedEtudeId]);

  // Chargement des groupes
  const loadGroupesInfo = async (etudeIds: (string | number)[]) => {
    try {
      const groupesData: Record<string, any> = {};
      const results = await Promise.allSettled(
        etudeIds.map(async (etudeId) => {
          try {
            const groupes = await groupeService.getGroupesByIdEtude(etudeId);
            return { etudeId, groupes: Array.isArray(groupes) ? groupes : [] };
          } catch (error) {
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

  // Normaliser les données de paiements
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

  // Chargement des volontaires
  const loadVolontairesInfo = useCallback(async (volontaireIds: (string | number)[]) => {
    try {
      const volontairesData: Record<string | number, any> = {};
      const results = await Promise.allSettled(
        volontaireIds.map(async (volontaireId) => {
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

  // Charger les paiements d'une étude
  const loadPaiements = useCallback(async (etudeId: number) => {
    try {
      setIsDetailLoading(true);
      setError('');

      const response = await etudeVolontaireService.getVolontairesByEtude(etudeId);
      const paiementsData = Array.isArray(response) ? response : response?.data || [];

      if (paiementsData.length === 0) {
        setPaiements([]);
        setVolontairesInfo({});
        setGroupesInfo({});
        setAnnulationsInfo({});
        setIsDetailLoading(false);
        return;
      }

      const normalizedPaiements = normalizePaiementsData(paiementsData);
      setPaiements(normalizedPaiements);

      await loadAnnulationsInfo(etudeId);

      const uniqueVolontaireIds = [...new Set(normalizedPaiements.map((p: any) => p.idVolontaire).filter((id: any) => id))];
      if (uniqueVolontaireIds.length > 0) {
        await loadVolontairesInfo(uniqueVolontaireIds);
      }

      await loadGroupesInfo([etudeId]);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setError(t('payments.errorLoadingData'));
    } finally {
      setIsDetailLoading(false);
    }
  }, [loadAnnulationsInfo, loadVolontairesInfo, t]);

  // Charger les paiements quand on sélectionne une étude
  useEffect(() => {
    if (selectedEtudeId !== null) {
      loadPaiements(selectedEtudeId);
    } else {
      setPaiements([]);
      setVolontairesInfo({});
      setGroupesInfo({});
      setAnnulationsInfo({});
    }
  }, [selectedEtudeId]);

  // Mise à jour du statut de paiement
  const updatePaiementStatus = async (paiement: Paiement, nouveauStatut: number) => {
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

      const updatedPaiements = paiements.map(p =>
        p.idEtude === paiement.idEtude && p.idVolontaire === paiement.idVolontaire
          ? { ...p, paye: nouveauStatut }
          : p
      );
      setPaiements(updatedPaiements);

      const numericEtudeId = typeof paiement.idEtude === 'string' ? parseInt(String(paiement.idEtude), 10) : paiement.idEtude;
      await refreshSummaryForEtude(numericEtudeId);

      try {
        const newEtudePayeStatus = await etudeService.checkAndUpdatePayeStatus(numericEtudeId, updatedPaiements);
        setEtudes(prev => prev.map(e =>
          e.idEtude === paiement.idEtude ? { ...e, paye: newEtudePayeStatus } : e
        ));
      } catch (etudeError) {
        console.error('Erreur mise à jour statut étude:', etudeError);
      }

      setUpdateStatus(prev => ({ ...prev, [key]: 'success' }));
      setTimeout(() => {
        setUpdateStatus(prev => { const s = { ...prev }; delete s[key]; return s; });
      }, 2000);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      setUpdateStatus(prev => ({ ...prev, [key]: 'error' }));
      const errorMessage = error?.response?.data?.details || error?.response?.data?.message || error.message || t('payments.errorUpdatingStatus');
      setError(errorMessage);
      setTimeout(() => {
        setUpdateStatus(prev => { const s = { ...prev }; delete s[key]; return s; });
      }, 3000);
    }
  };

  // Filtrage des paiements dans la vue détail
  const paiementsFiltres = useMemo(() => {
    let filtered = paiements;

    // Filtrer les annulés
    if (!showAnnules) {
      filtered = filtered.filter(p => !isVolontaireAnnule(p.idVolontaire, p.idEtude));
    }

    if (showOnlyUnpaid) {
      filtered = filtered.filter(p => p.paye === 0);
    }

    return filtered;
  }, [paiements, showOnlyUnpaid, showAnnules, isVolontaireAnnule]);

  // Statistiques de la vue détail
  const statistics = useMemo(() => {
    const paiementsActifs = paiementsFiltres.filter(p => !isVolontaireAnnule(p.idVolontaire, p.idEtude));
    const paiementsAnnules = paiements.filter(p => isVolontaireAnnule(p.idVolontaire, p.idEtude));
    const paiementsAvecIv = paiementsActifs.filter(p => (p.iv || 0) > 0);
    const total = paiementsFiltres.length;
    const payes = paiementsAvecIv.filter(p => p.paye === 1).length;
    const nonPayes = paiementsAvecIv.filter(p => p.paye === 0).length;
    const enAttente = paiementsAvecIv.filter(p => p.paye === 2).length;
    const totalMontant = paiementsAvecIv.reduce((sum, p) => sum + (p.iv || 0), 0);
    const montantPaye = paiementsAvecIv.filter(p => p.paye === 1).reduce((sum, p) => sum + (p.iv || 0), 0);

    return {
      total,
      payes,
      nonPayes,
      enAttente,
      totalMontant,
      montantPaye,
      montantRestant: totalMontant - montantPaye,
      annulesCount: paiementsAnnules.length,
      montantAnnules: paiementsAnnules.reduce((sum, p) => sum + (p.iv || 0), 0)
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
    return etude ? etude.ref : `Etude #${idEtude}`;
  };

  const getGroupeName = (idGroupe: string | number, idEtude: string | number) => {
    const groupe = groupesInfo[idGroupe];
    if (groupe) return groupe.nom || groupe.libelle || `Groupe ${idGroupe}`;
    const groupesEtude = groupesInfo[`etude_${idEtude}`] || [];
    const groupeInEtude = groupesEtude.find((g: any) => g.id === idGroupe || g.idGroupe === idGroupe);
    if (groupeInEtude) return groupeInEtude.nom || groupeInEtude.libelle || `Groupe ${idGroupe}`;
    return `Groupe #${idGroupe}`;
  };

  // Marquer tout comme payé
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
        await loadPaiements(selectedEtudeId!);
        await refreshSummaryForEtude(selectedEtudeData.idEtude);
        try {
          const numericId = typeof selectedEtudeData.idEtude === 'string' ? parseInt(String(selectedEtudeData.idEtude), 10) : selectedEtudeData.idEtude;
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

  // Marquer tout comme non payé
  const markAllAsUnpaidBatch = async () => {
    if (!selectedEtudeData || !paiements || paiements.length === 0) return;

    const paidVolunteers = paiements.filter(p => p.paye === 1 && !isVolontaireAnnule(p.idVolontaire, p.idEtude));
    if (paidVolunteers.length === 0) { setError('Aucun volontaire payé à modifier.'); return; }

    const confirmed = window.confirm(
      `Marquer ${paidVolunteers.length} volontaire(s) comme NON PAYÉ pour l'étude ${selectedEtudeData.ref} ?\n\nCette action est irréversible.`
    );
    if (!confirmed) return;

    setIsMassUpdating(true);
    setError('');
    try {
      for (const p of paidVolunteers) {
        await api.patch('/etude-volontaires/update-paye', null, {
          params: {
            idEtude: p.idEtude,
            idGroupe: p.idGroupe,
            idVolontaire: p.idVolontaire,
            iv: p.iv,
            numsujet: p.numsujet,
            paye: p.paye,
            statut: p.statut,
            nouveauPaye: 0
          }
        });
      }
      await loadPaiements(selectedEtudeId!);
      if (selectedEtudeData.idEtude != null) {
        await refreshSummaryForEtude(selectedEtudeData.idEtude);
        try {
          const numericId = typeof selectedEtudeData.idEtude === 'string' ? parseInt(String(selectedEtudeData.idEtude), 10) : selectedEtudeData.idEtude;
          await etudeService.updatePayeStatus(numericId, 0);
          setEtudes(prev => prev.map(e => e.idEtude === selectedEtudeData.idEtude ? { ...e, paye: 0 } : e));
        } catch (e) {}
      }
    } catch (error) {
      console.error('Erreur mark-all-unpaid:', error);
      setError('Erreur lors du marquage en non payé.');
    } finally {
      setIsMassUpdating(false);
    }
  };

  // Vérification des permissions
  const canManagePaiements = useMemo(() => {
    if (!authContext) return false;
    const { isAuthenticated, user, isAdmin, hasPermission } = authContext;
    if (!isAuthenticated || !user) return false;
    let canAccess = false;
    if (typeof isAdmin === 'function') canAccess = isAdmin();
    if (!canAccess && typeof hasPermission === 'function') canAccess = hasPermission(2);
    if (!canAccess && (user.role === 1 || user.role === 2)) canAccess = true;
    return canAccess;
  }, [authContext]);

  // Fonction pour formater les dates
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR');
    } catch {
      return dateStr;
    }
  };

  // Retour à la liste
  const handleBackToList = () => {
    setSelectedEtudeId(null);
    setShowOnlyUnpaid(false);
    setShowAnnules(false);
  };

  // Loading initial
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Accès refusé
  if (!canManagePaiements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{t('common.accessDenied')}</h1>
          <p className="text-gray-600">{t('common.adminOnly')}</p>
          <div className="mt-4 space-x-3">
            <button onClick={() => window.history.back()} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors">
              {t('common.back')}
            </button>
            <button onClick={() => window.location.href = '/dashboard'} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors">
              {t('sidebar.dashboard')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleUpdatePaiementStatus = (payment: any, status: number) => {
    updatePaiementStatus(payment as Paiement, status);
  };

  // ===== VUE DÉTAIL =====
  if (selectedEtudeId !== null) {
    return (
      <div className="space-y-6">
        {/* Bouton retour + titre */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {selectedEtudeData?.ref || `Etude #${selectedEtudeId}`}
            </h1>
            {selectedEtudeData?.dateDebut && (
              <p className="text-sm text-gray-500">
                {formatDate(selectedEtudeData.dateDebut)}
                {selectedEtudeData.dateFin && ` - ${formatDate(selectedEtudeData.dateFin)}`}
              </p>
            )}
          </div>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
            <button onClick={() => setError('')} className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700">
              x
            </button>
          </div>
        )}

        {isDetailLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <StatsSummary statistics={statistics} />

            {/* Filtres détail + Export */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-unpaid"
                    checked={showOnlyUnpaid}
                    onCheckedChange={(checked) => setShowOnlyUnpaid(checked === true)}
                  />
                  <Label htmlFor="show-unpaid" className="text-sm cursor-pointer">
                    Afficher non payés uniquement
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-annules"
                    checked={showAnnules}
                    onCheckedChange={(checked) => setShowAnnules(checked === true)}
                  />
                  <Label htmlFor="show-annules" className="text-sm cursor-pointer">
                    Afficher annulés
                  </Label>
                </div>
              </div>

              {selectedEtudeData && paiements.length > 0 && (
                <ExcelExport
                  etude={selectedEtudeData}
                  paiements={paiementsFiltres}
                  volontairesInfo={volontairesInfo}
                />
              )}
            </div>

            {/* Actions en masse */}
            <MassActionsPanel
              selectedEtudeRef={selectedEtudeData?.ref || ''}
              paiements={paiements}
              isVolontaireAnnule={isVolontaireAnnule}
              isMassUpdating={isMassUpdating}
              statistics={statistics}
              onMarkAll={markAllAsPaidBatch}
              onMarkAllUnpaid={markAllAsUnpaidBatch}
            />

            {/* Table des paiements */}
            {paiementsFiltres.length === 0 ? (
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
          </>
        )}
      </div>
    );
  }

  // ===== VUE LISTE =====
  return (
    <div className="space-y-6">
      {/* Titre */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">{t('payments.title')}</h1>
        <span className="text-sm text-gray-500">
          {etudesFiltrees.length} étude{etudesFiltrees.length > 1 ? 's' : ''}
          {isSummaryLoading && <span className="ml-2 animate-pulse">Chargement...</span>}
        </span>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
          <button onClick={() => setError('')} className="absolute top-0 right-0 mt-2 mr-2 text-red-500 hover:text-red-700">
            x
          </button>
        </div>
      )}

      {/* Filtres */}
      <FiltersPanel
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statutPaiement={statutPaiement}
        setStatutPaiement={setStatutPaiement}
        allPaiementsLoaded={allPaiementsLoaded}
        paiementStatusMap={PAIEMENT_STATUS}
      />

      {/* Tableau des études */}
      {etudesFiltrees.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || statutPaiement !== 'all' ? t('payments.noMatchingStudy') : 'Aucune étude trouvée'}
          </h3>
          <p className="text-gray-500">
            {searchQuery || statutPaiement !== 'all' ? t('payments.noMatchingStudyDesc') : 'Il n\'y a aucune étude disponible.'}
          </p>
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead className="text-center">Volontaires</TableHead>
                <TableHead className="text-center">Payés</TableHead>
                <TableHead className="text-center">Non payés</TableHead>
                <TableHead className="text-right">Montant total</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {etudesFiltrees.map((etude) => {
                const summary = paiementsSummaryByEtude[etude.idEtude as string | number];
                const payes = summary?.payes ?? 0;
                const nonPayes = summary?.nonPayes ?? 0;
                const totalVol = payes + nonPayes + (summary?.enAttente ?? 0);
                const montantTotal = summary?.montantTotal ?? summary?.montantPaye ?? 0;
                const overdue = isEtudeOverdue(etude);
                const allPaid = etude.paye === 2 || (totalVol > 0 && nonPayes === 0);

                return (
                  <TableRow
                    key={etude.idEtude}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${overdue ? 'bg-red-50 hover:bg-red-100' : ''}`}
                    onClick={() => setSelectedEtudeId(etude.idEtude as number)}
                  >
                    <TableCell className={`font-medium ${overdue ? 'text-red-700' : ''}`}>
                      {etude.ref || `#${etude.idEtude}`}
                    </TableCell>
                    <TableCell className={overdue ? 'text-red-600' : ''}>
                      {formatDate(etude.dateDebut)}
                    </TableCell>
                    <TableCell className={overdue ? 'text-red-600' : ''}>
                      {formatDate(etude.dateFin)}
                    </TableCell>
                    <TableCell className="text-center">
                      {totalVol}
                    </TableCell>
                    <TableCell className="text-center">
                      {payes > 0 && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          {payes}
                        </Badge>
                      )}
                      {payes === 0 && '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {nonPayes > 0 && (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 border-red-200">
                          {nonPayes}
                        </Badge>
                      )}
                      {nonPayes === 0 && '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {montantTotal > 0 ? `${montantTotal} EUR` : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {allPaid ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                          Payé
                        </Badge>
                      ) : nonPayes > 0 ? (
                        <Badge variant="secondary" className={`${overdue ? 'bg-red-200 text-red-800 border-red-300' : 'bg-red-100 text-red-700 border-red-200'}`}>
                          Non payé
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                          -
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};

export default PaiementsPage;
