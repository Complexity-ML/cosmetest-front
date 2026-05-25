// ============================================================
// IndemniteManager.tsx - Composant principal (refactorisé)
// ============================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import etudeVolontaireService from "../../services/etudeVolontaireService";
import groupeService from "../../services/groupeService";
import annulationService from "../../services/annulationService";
import api from "../../services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  AlertTriangle,
  TrendingUp,
  Users,
  Euro,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "lucide-react";

import type { VolontaireAssigne, UpdateStatusMap, UpdateParams, IndemniteManagerProps } from "./indemnite/types";
import { useEntitiesInfo } from "./indemnite/useEntitiesInfo";
import { NumSujetInput, IVInput } from "./indemnite/InputComponents";
import StatutDisplay from "./indemnite/StatutDisplay";
import { AnnulationButton, DeleteButton } from "./indemnite/ActionButtons";
import BatchActions from "./indemnite/BatchActions";

const IndemniteManager: React.FC<IndemniteManagerProps> = ({
  etudeId,
  etudeTitre,
  etudeRef,
  onError = () => {},
  showDebugInfo = false,
  rdvs,
}) => {
  const { t } = useTranslation();

  // États
  const [volontairesAssignes, setVolontairesAssignes] = useState<VolontaireAssigne[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusMap>({});
  const [sortConfig, setSortConfig] = useState<{
    column: 'nom' | 'numsujet' | 'iv' | 'none';
    order: 'asc' | 'desc';
  }>({ column: 'none', order: 'asc' });
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Hooks personnalisés
  const { volontairesInfo, loadGroupesInfo, loadVolontairesInfo } = useEntitiesInfo();

  // IDs des volontaires qui ont au moins un RDV (fallback sur volontaire imbriqué si idVolontaire null)
  const volunteerIdsWithRdv = useMemo(() => {
    if (!rdvs || rdvs.length === 0) return new Set<number>();
    return new Set(rdvs.map((rdv: any) => rdv.idVolontaire || rdv.volontaire?.idVol || rdv.volontaire?.id).filter(Boolean));
  }, [rdvs]);

  // Fonctions de gestion des annulations
  const enregistrerAnnulation = useCallback(async (
    volontaire: VolontaireAssigne,
    commentaire: string = "",
    annulePar: 'COSMETEST' | 'VOLONTAIRE' = 'COSMETEST'
  ) => {
    try {
      const annulationData = {
        idVol: volontaire.idVolontaire,
        idEtude: parseInt(etudeId.toString()),
        dateAnnulation: new Date().toISOString().split('T')[0],
        commentaire: commentaire || `Annulation manuelle`,
        annulePar: annulePar
      };
      await annulationService.createWithValidation(annulationData);
      setDebugInfo(`Annulation enregistrée pour le volontaire ${volontaire.idVolontaire} (par ${annulePar})`);
    } catch (error: unknown) {
      console.error("Erreur lors de l'enregistrement de l'annulation:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as any).response?.data?.message || String(error)
        : error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors de l'enregistrement de l'annulation: ${errorMessage}`);
    }
  }, [etudeId]);

  const changerStatutVersAnnule = useCallback(async (
    volontaire: VolontaireAssigne,
    commentaire: string,
    annulePar: 'COSMETEST' | 'VOLONTAIRE'
  ) => {
    const volontaireId = volontaire.idVolontaire;
    const statusKey = `${volontaireId}_annulation`;
    try {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "loading" }));
      await enregistrerAnnulation(volontaire, commentaire, annulePar);
      await api.delete("/etude-volontaires/delete-by-etude-volontaire", {
        params: {
          idEtude: parseInt(etudeId.toString()),
          idVolontaire: volontaire.idVolontaire,
        },
      });
      setVolontairesAssignes((prev) =>
        prev.filter((v) => !(v.idVolontaire === volontaireId && v.idGroupe === (volontaire.idGroupe || 0)))
      );
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      setDebugInfo(`Volontaire annulé par ${annulePar} : association supprimée, RDV supprimés, annulation enregistrée. Commentaire: ${commentaire}`);
      setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 2000);
    } catch (error: unknown) {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "error" }));
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as any).response?.data?.message || String(error)
        : error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur annulation: ${errorMessage}`);
      setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 3000);
    }
  }, [etudeId, enregistrerAnnulation]);

  const batchAnnuler = useCallback(async (
    volontairesAannuler: VolontaireAssigne[],
    commentaire: string,
    annulePar: 'COSMETEST' | 'VOLONTAIRE'
  ) => {
    for (const volontaire of volontairesAannuler) {
      await changerStatutVersAnnule(volontaire, commentaire, annulePar);
    }
  }, [changerStatutVersAnnule]);

  // Fonction générique de mise à jour
  const updateVolontaire = useCallback(async (
    volontaire: VolontaireAssigne,
    field: 'statut' | 'numsujet' | 'iv',
    newValue: string | number,
    endpoint: string
  ) => {
    const volontaireId = volontaire.idVolontaire;
    const statusKey = `${volontaireId}_${field}`;
    try {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "loading" }));
      const currentValue = field === "numsujet" ? volontaire.numsujet || 0 : field === "iv" ? volontaire.iv || 0 : volontaire.statut || "inscrit";
      if (String(newValue) === String(currentValue)) {
        setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
        setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 1000);
        return;
      }
      const baseParams = {
        idEtude: parseInt(etudeId.toString()),
        idGroupe: volontaire.idGroupe || 0,
        idVolontaire: volontaire.idVolontaire,
        iv: volontaire.iv || 0,
        numsujet: volontaire.numsujet || 0,
        paye: volontaire.paye || 0,
        statut: volontaire.statut || "INSCRIT",
      };
      let params: UpdateParams = { ...baseParams };
      if (field === "statut") params.nouveauStatut = newValue as string;
      else if (field === "numsujet") params.nouveauNumSujet = parseInt(newValue.toString()) || 0;
      else if (field === "iv") params.nouvelIV = parseInt(newValue.toString()) || 0;

      await api.patch(endpoint, null, { params });
      setVolontairesAssignes((prev) =>
        prev.map((v) =>
          v.idVolontaire === volontaireId && v.idGroupe === volontaire.idGroupe
            ? { ...v, [field]: field === "statut" ? newValue : parseInt(newValue.toString()) || 0 }
            : v
        )
      );
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      setDebugInfo(`${field} mis à jour: ${currentValue} vers ${newValue}`);
      setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 2000);
    } catch (error: unknown) {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "error" }));
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as any).response?.data?.message || String(error)
        : 'Erreur inconnue';
      setError(`Erreur ${field}: ${errorMessage}`);
      setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 3000);
    }
  }, [etudeId]);

  // Suppression volontaire ID=0
  const deleteVolontaire = useCallback(async (volontaire: VolontaireAssigne) => {
    const volontaireId = volontaire.idVolontaire;
    const statusKey = `${volontaireId}_delete`;
    if (volontaireId !== 0) { setError("Seuls les volontaires avec ID = 0 peuvent être supprimés"); return; }
    try {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "loading" }));
      const params = {
        idEtude: parseInt(etudeId.toString()),
        idGroupe: volontaire.idGroupe || 0,
        idVolontaire: volontaire.idVolontaire,
        iv: volontaire.iv || 0,
        numsujet: volontaire.numsujet || 0,
        paye: volontaire.paye || 0,
        statut: volontaire.statut || "-",
      };
      await api.delete("/etude-volontaires/delete", { params });
      setVolontairesAssignes((prev) => prev.filter((v) => !(v.idVolontaire === volontaireId && v.idGroupe === volontaire.idGroupe)));
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 2000);
    } catch (error: unknown) {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "error" }));
      const errorMessage = error && typeof error === 'object' && 'response' in error
        ? (error as any).response?.data?.message || String(error)
        : 'Erreur inconnue';
      setError(`Erreur suppression: ${errorMessage}`);
      setTimeout(() => { setUpdateStatus((prev) => { const n = { ...prev }; delete n[statusKey]; return n; }); }, 3000);
    }
  }, [etudeId]);

  // Fonctions spécialisées
  const updateStatut = useCallback((volontaire: VolontaireAssigne, nouveauStatut: string) => {
    return updateVolontaire(volontaire, "statut", nouveauStatut, "/etude-volontaires/update-statut");
  }, [updateVolontaire]);

  const updateIV = useCallback((volontaire: VolontaireAssigne, nouvelleIV: string | number) => {
    return updateVolontaire(volontaire, "iv", nouvelleIV, "/etude-volontaires/update-iv");
  }, [updateVolontaire]);

  // Batch updates
  const batchUpdateIV = useCallback(async (ids: number[], newIV: number) => {
    for (const id of ids) {
      const vol = volontairesAssignes.find(v => v.idVolontaire === id);
      if (vol) await updateVolontaire(vol, "iv", newIV, "/etude-volontaires/update-iv");
    }
  }, [volontairesAssignes, updateVolontaire]);

  const batchUpdateStatut = useCallback(async (ids: number[], newStatut: string) => {
    for (const id of ids) {
      const vol = volontairesAssignes.find(v => v.idVolontaire === id);
      if (vol) await updateVolontaire(vol, "statut", newStatut, "/etude-volontaires/update-statut");
    }
  }, [volontairesAssignes, updateVolontaire]);

  // Noms des volontaires
  const getVolontaireName = useMemo(
    () => (idVolontaire: number) => {
      if (!idVolontaire) return t('indemnity.volunteerNotAssigned');
      if (idVolontaire === 0) return t('indemnity.temporaryVolunteer');
      const volontaire = volontairesInfo[idVolontaire];
      if (!volontaire) return `${t('indemnity.volunteer')} #${idVolontaire}`;
      const prenom = volontaire.prenom || volontaire.prenomVol || volontaire.prenomVolontaire || "";
      const nom = volontaire.nom || volontaire.nomVol || volontaire.nomVolontaire || "";
      if (prenom && nom) return `${nom} ${prenom}`;
      if (nom) return nom;
      if (prenom) return prenom;
      if (volontaire.nomComplet) return volontaire.nomComplet;
      return `${t('indemnity.volunteer')} #${idVolontaire}`;
    },
    [volontairesInfo, t]
  );

  const getVolontaireNomPrenom = useMemo(
    () => (idVolontaire: number): { nom: string; prenom: string } => {
      if (!idVolontaire || idVolontaire === 0) return { nom: '', prenom: '' };
      const volontaire = volontairesInfo[idVolontaire];
      if (!volontaire) return { nom: '', prenom: '' };
      const prenom = (volontaire.prenom || volontaire.prenomVol || volontaire.prenomVolontaire || "").toLowerCase();
      const nom = (volontaire.nom || volontaire.nomVol || volontaire.nomVolontaire || "").toLowerCase();
      return { nom, prenom };
    },
    [volontairesInfo]
  );

  // Tri
  const volontairesTries = useMemo(() => {
    if (sortConfig.column === 'none') return volontairesAssignes;
    const sorted = [...volontairesAssignes].sort((a, b) => {
      let comparison = 0;
      if (sortConfig.column === 'nom') {
        const volA = getVolontaireNomPrenom(a.idVolontaire);
        const volB = getVolontaireNomPrenom(b.idVolontaire);
        comparison = volA.nom.localeCompare(volB.nom, 'fr');
        if (comparison === 0) comparison = volA.prenom.localeCompare(volB.prenom, 'fr');
      } else if (sortConfig.column === 'numsujet') {
        comparison = (a.numsujet || 0) - (b.numsujet || 0);
      } else if (sortConfig.column === 'iv') {
        comparison = (a.iv || 0) - (b.iv || 0);
      }
      return sortConfig.order === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [volontairesAssignes, sortConfig, getVolontaireNomPrenom]);

  const handleSort = useCallback((column: 'nom' | 'numsujet' | 'iv') => {
    setSortConfig((prev) => {
      if (prev.column === column) return { column, order: prev.order === 'asc' ? 'desc' : 'asc' };
      return { column, order: 'asc' };
    });
  }, []);

  // Statistiques
  const statistics = useMemo(() => ({
    totalIndemnites: volontairesAssignes.reduce((total, v) => total + (v.iv || 0), 0),
    moyenneIndemnite: volontairesAssignes.length > 0 ? volontairesAssignes.reduce((total, v) => total + (v.iv || 0), 0) / volontairesAssignes.length : 0,
    nombreVolontaires: volontairesAssignes.length,
    volontairesTemporaires: volontairesAssignes.filter(v => v.idVolontaire === 0).length,
    volontairesSansRdv: rdvs ? volontairesAssignes.filter(v => v.idVolontaire !== 0 && !volunteerIdsWithRdv.has(v.idVolontaire)).length : 0,
  }), [volontairesAssignes, rdvs, volunteerIdsWithRdv]);

  // Sélection
  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === volontairesTries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(volontairesTries.map(v => v.idVolontaire)));
    }
  }, [selectedIds.size, volontairesTries]);

  // Helper pour parser la réponse etude-volontaire
  const parseEtudeVolontaireResponse = (response: any): VolontaireAssigne[] => {
    if (Array.isArray(response)) return response;
    if (response?.success && Array.isArray(response.data)) return response.data;
    if (response && Array.isArray(response.data)) return response.data;
    console.warn("Format de réponse inattendu:", response);
    return [];
  };

  // Chargement des données
  useEffect(() => {
    const fetchVolontaires = async () => {
      if (!etudeId) return;
      try {
        setIsLoading(true);
        const response = await etudeVolontaireService.getVolontairesByEtude(etudeId);
        let assignes: VolontaireAssigne[] = parseEtudeVolontaireResponse(response);
        const deduplicatedAssignes = Object.values(
          assignes.reduce((acc: Record<number, VolontaireAssigne>, vol: VolontaireAssigne) => {
            const existing = acc[vol.idVolontaire];
            if (!existing || (vol.numsujet || 0) > (existing.numsujet || 0)) acc[vol.idVolontaire] = vol;
            return acc;
          }, {} as Record<number, VolontaireAssigne>)
        );
        // Réparer les volontaires présents dans les RDV mais absents de etude_volontaire
        const assignedIds = new Set(deduplicatedAssignes.map((v) => v.idVolontaire));
        const rdvVolontaireIds = rdvs
          ? [...new Set(rdvs.map((rdv: any) => rdv.idVolontaire || rdv.volontaire?.idVol || rdv.volontaire?.id).filter(Boolean) as number[])]
          : [];
        const missingIds = rdvVolontaireIds.filter((id: number) => !assignedIds.has(id));

        // Pour chaque volontaire manquant, créer l'entrée etude_volontaire avec les vraies données de sa RDV
        const repairedAssignes: VolontaireAssigne[] = await Promise.all(
          missingIds.map(async (id: number) => {
            const volRdv = rdvs?.find((r: any) =>
              (r.idVolontaire || r.volontaire?.idVol || r.volontaire?.id) === id
            );
            const idGroupe = volRdv?.idGroupe || volRdv?.groupe?.idGroupe || volRdv?.groupe?.id || 0;
            let iv = 0;
            if (idGroupe) {
              try {
                const groupeData = await groupeService.getById(idGroupe);
                iv = groupeData?.iv ?? 0;
              } catch { /* iv reste 0 */ }
            }
            const entry: VolontaireAssigne = { idVolontaire: id, idGroupe, idEtude: Number(etudeId), iv, numsujet: 0, paye: 0, statut: 'INSCRIT' };
            try {
              await etudeVolontaireService.create(entry);
            } catch { /* entrée peut-être déjà créée en parallèle, on continue */ }
            return entry;
          })
        );

        const allAssignes = [...deduplicatedAssignes, ...repairedAssignes];

        setVolontairesAssignes(allAssignes);
        setDebugInfo(`${allAssignes.length} volontaires trouvés`);
        if (allAssignes.length > 0) {
          const uniqueGroupeIds = [...new Set(allAssignes.map((v) => v.idGroupe).filter((id) => id && id !== 0))] as number[];
          const uniqueVolontaireIds = [...new Set(allAssignes.map((v) => v.idVolontaire).filter((id) => id && id !== 0))] as number[];
          await Promise.all([loadGroupesInfo(uniqueGroupeIds), loadVolontairesInfo(uniqueVolontaireIds)]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des volontaires:", error);
        setVolontairesAssignes([]);
        setError("Erreur lors du chargement des volontaires");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVolontaires();
  }, [etudeId, rdvs, loadGroupesInfo, loadVolontairesInfo]);

  useEffect(() => { if (error) onError(error); }, [error, onError]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{t('indemnity.title')}</h3>
          <p className="text-sm text-gray-600 mt-1">{etudeTitre} {etudeRef && `(${etudeRef})`}</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={() => setError("")} className="absolute top-2 right-2">×</Button>
        </Alert>
      )}
      {showDebugInfo && debugInfo && (
        <Alert>
          <AlertDescription><strong>Debug:</strong> {debugInfo}</AlertDescription>
          <Button variant="ghost" size="sm" onClick={() => setDebugInfo("")} className="absolute top-2 right-2">×</Button>
        </Alert>
      )}

      {/* Alerte volontaires temporaires */}
      {statistics.volontairesTemporaires > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('indemnity.temporaryVolunteerWarning', { count: statistics.volontairesTemporaires })}
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte volontaires sans RDV */}
      {statistics.volontairesSansRdv > 0 && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{statistics.volontairesSansRdv}</strong> volontaire{statistics.volontairesSansRdv > 1 ? 's' : ''} sans rendez-vous attribué (lignes surlignées en orange).
            C'est probablement une erreur : oubli d'attribution de RDV ou oubli de retirer le volontaire.
          </AlertDescription>
        </Alert>
      )}

      {/* Alerte aucun volontaire */}
      {volontairesAssignes.length === 0 && !isLoading && (
        <Alert className="border-orange-300 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-orange-800">
              Aucun volontaire trouvé pour cette étude. Si des RDV sont assignés, les associations ont peut-être été perdues.
            </span>
            <Button
              variant="outline"
              size="sm"
              className="ml-4 border-orange-400 text-orange-700 hover:bg-orange-100"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  const response = await api.post(`/etude-volontaires/repair/${etudeId}`);
                  const result = response.data;
                  if (result.repaired > 0) {
                    alert(`${result.repaired} association(s) réparée(s) sur ${result.missing} manquante(s).`);
                    window.location.reload();
                  } else {
                    alert('Aucune association manquante détectée.');
                  }
                } catch (err: any) {
                  alert('Erreur lors de la réparation: ' + (err?.message || 'Erreur inconnue'));
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              Réparer les associations
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Info sauvegarde auto */}
      <div className="flex items-center justify-between gap-4">
        <Alert className="flex-1">
          <Save className="h-4 w-4" />
          <AlertDescription>{t('indemnity.autoSave')}</AlertDescription>
        </Alert>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Euro className="w-4 h-4" />{t('indemnity.totalIndemnities')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">{statistics.totalIndemnites.toFixed(0)} €</p>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" />{statistics.nombreVolontaires} {t('studies.volunteers')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />{t('indemnity.averagePerVolunteer')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">{statistics.moyenneIndemnite.toFixed(0)} €</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Users className="w-4 h-4" />{t('indemnity.assignedVolunteers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900">{statistics.nombreVolontaires}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <Clock className="w-4 h-4" />{t('indemnity.temporaryVolunteers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-900">{statistics.volontairesTemporaires}</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch actions */}
      <BatchActions
        selectedIds={selectedIds}
        volontaires={volontairesAssignes}
        onBatchUpdateIV={batchUpdateIV}
        onBatchUpdateStatut={batchUpdateStatut}
        onBatchAnnuler={batchAnnuler}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Tableau */}
      {statistics.nombreVolontaires === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">{t('indemnity.noVolunteerAssigned')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  <input
                    type="checkbox"
                    checked={volontairesTries.length > 0 && selectedIds.size === volontairesTries.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('nom')} className="flex items-center gap-2 hover:text-gray-700 transition-colors" title={t('indemnity.sortByName')}>
                    {t('indemnity.volunteer')}
                    {sortConfig.column !== 'nom' && <ArrowUpDown className="w-4 h-4" />}
                    {sortConfig.column === 'nom' && sortConfig.order === 'asc' && <ArrowUp className="w-4 h-4" />}
                    {sortConfig.column === 'nom' && sortConfig.order === 'desc' && <ArrowDown className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('numsujet')} className="flex items-center gap-2 hover:text-gray-700 transition-colors" title={t('indemnity.sortBySubjectNumber')}>
                    {t('indemnity.subjectNumber')}
                    {sortConfig.column !== 'numsujet' && <ArrowUpDown className="w-4 h-4" />}
                    {sortConfig.column === 'numsujet' && sortConfig.order === 'asc' && <ArrowUp className="w-4 h-4" />}
                    {sortConfig.column === 'numsujet' && sortConfig.order === 'desc' && <ArrowDown className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button onClick={() => handleSort('iv')} className="flex items-center gap-2 hover:text-gray-700 transition-colors" title={t('indemnity.sortByIndemnity')}>
                    {t('indemnity.indemnityAmount')}
                    {sortConfig.column !== 'iv' && <ArrowUpDown className="w-4 h-4" />}
                    {sortConfig.column === 'iv' && sortConfig.order === 'asc' && <ArrowUp className="w-4 h-4" />}
                    {sortConfig.column === 'iv' && sortConfig.order === 'desc' && <ArrowDown className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('indemnity.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volontairesTries.map((volontaire) => {
                const hasNoRdv = rdvs && volontaire.idVolontaire !== 0 && !volunteerIdsWithRdv.has(volontaire.idVolontaire);
                return (
                  <tr
                    key={`${volontaire.idVolontaire}-${volontaire.idGroupe}`}
                    className={`
                      ${volontaire.idVolontaire === 0 ? "bg-yellow-50" : ""}
                      ${hasNoRdv ? "bg-orange-50 border-l-4 border-l-orange-400" : ""}
                    `}
                  >
                    <td className="px-3 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(volontaire.idVolontaire)}
                        onChange={() => handleToggleSelect(volontaire.idVolontaire)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">
                          {volontaire.idVolontaire !== 0 ? (
                            <a
                              href={`/volontaires/${volontaire.idVolontaire}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                            >
                              {getVolontaireName(volontaire.idVolontaire)}
                            </a>
                          ) : (
                            <>
                              {getVolontaireName(volontaire.idVolontaire)}
                              <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                {t('indemnity.temporary')}
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {volontaire.idVolontaire}
                          {hasNoRdv && (
                            <span className="ml-2 text-orange-600 font-medium">
                              ⚠ Sans RDV
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <NumSujetInput
                        volontaire={volontaire}
                        volontairesAssignes={volontairesAssignes}
                        volontairesInfo={volontairesInfo}
                        updateStatus={updateStatus}
                        onUpdate={updateVolontaire}
                      />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <IVInput
                        volontaire={volontaire}
                        updateStatus={updateStatus}
                        onUpdate={updateIV}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <StatutDisplay
                        volontaire={volontaire}
                        updateStatus={updateStatus}
                        onUpdateStatut={updateStatut}
                      />
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <AnnulationButton
                          volontaire={volontaire}
                          updateStatus={updateStatus}
                          onAnnuler={changerStatutVersAnnule}
                        />
                        <DeleteButton
                          volontaire={volontaire}
                          updateStatus={updateStatus}
                          onDelete={deleteVolontaire}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IndemniteManager;
