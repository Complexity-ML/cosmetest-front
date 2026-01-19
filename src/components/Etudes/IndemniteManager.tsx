// ============================================================
// IndemniteManager.tsx - Version avec bouton d'annulation dédié
// ============================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import etudeVolontaireService from "../../services/etudeVolontaireService";
import groupeService from "../../services/groupeService";
import volontaireService from "../../services/volontaireService";
import annulationService from "../../services/annulationService";
import api from "../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Save,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Handshake,
  XCircle,
  Edit2,
  Check,
  X,
  Trash2,
  Users,
  Euro,
  UserX,
  Clock,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";

// ===============================
// TYPES
// ===============================

interface StatutConfigItem {
  label: string;
  icon: string;
  style: string;
}

interface VolontaireAssigne {
  idVolontaire: number;
  idGroupe: number;
  idEtude: number;
  iv: number;
  numsujet: number;
  paye: number;
  statut: string;
}

interface VolontaireInfo {
  prenom?: string;
  prenomVol?: string;
  prenomVolontaire?: string;
  nom?: string;
  nomVol?: string;
  nomVolontaire?: string;
  nomComplet?: string;
}

interface GroupeInfo {
  id: number;
  nom?: string;
}

interface IndemniteManagerProps {
  etudeId: string | number;
  etudeTitre?: string;
  etudeRef?: string;
  onError?: (error: string) => void;
  showDebugInfo?: boolean;
}

interface UpdateStatusMap {
  [key: string]: 'loading' | 'success' | 'error' | 'cancelled';
}

interface UpdateParams {
  idEtude: number;
  idGroupe: number;
  idVolontaire: number;
  iv: number;
  numsujet: number;
  paye: number;
  statut: string;
  nouveauStatut?: string;
  nouveauNumSujet?: number;
  nouvelIV?: number;
}

// ===============================
// UTILITAIRES DE STATUT
// ===============================

const STATUT_CONFIG: Record<string, StatutConfigItem> = {
  inscrit: {
    label: "Inscrit",
    icon: "FileText",
    style: "bg-blue-100 text-blue-800 border-blue-300",
  },
  surbook: {
    label: "Surbook",
    icon: "TrendingUp",
    style: "bg-orange-100 text-orange-800 border-orange-300",
  },
  penalite: {
    label: "Pénalité",
    icon: "AlertTriangle",
    style: "bg-red-100 text-red-800 border-red-300",
  },
  parrainage: {
    label: "Parrainage",
    icon: "Handshake",
    style: "bg-purple-100 text-purple-800 border-purple-300",
  },
  annule: {
    label: "Annulé",
    icon: "XCircle",
    style: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

const normalizeStatut = (statut: string | null | undefined): string => {
  if (
    !statut ||
    statut === "" ||
    statut === "-" ||
    statut === null ||
    statut === undefined
  ) {
    return "inscrit";
  }

  return statut
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_\s]/g, "")
    .replace(/\s+/g, "_");
};

const getStatutConfig = (statut: string | null | undefined): StatutConfigItem => {
  const normalized = normalizeStatut(statut);
  return (
    STATUT_CONFIG[normalized] || {
      label: `${statut} (non reconnu)`,
      icon: "❓",
      style: "bg-gray-100 text-gray-800 border-gray-300",
    }
  );
};

// Fonction pour obtenir le statut de base et la raison
const parseStatut = (statutComplet: string | null | undefined): { statutBase: string; raison: string } => {
  if (!statutComplet) return { statutBase: "inscrit", raison: "" };

  const statut = statutComplet.toString().trim();

  if (statut.includes(" : ")) {
    const [statutBase, ...raisonParts] = statut.split(" : ");
    return {
      statutBase: normalizeStatut(statutBase.trim()),
      raison: raisonParts.join(" : ").trim()
    };
  }

  return {
    statutBase: normalizeStatut(statut),
    raison: ""
  };
};

// Composant pour rendre les icônes de statut
const StatutIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = "w-4 h-4" }) => {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className={className} />,
    TrendingUp: <TrendingUp className={className} />,
    AlertTriangle: <AlertTriangle className={className} />,
    Handshake: <Handshake className={className} />,
    XCircle: <XCircle className={className} />,
  };
  
  return <>{icons[iconName] || <AlertCircle className={className} />}</>;
};


// ===============================
// HOOKS PERSONNALISÉS
// ===============================

/**
 * Hook pour gérer les informations des entités
 */
const useEntitiesInfo = () => {
  const [groupesInfo, setGroupesInfo] = useState<Record<number, GroupeInfo>>({});
  const [volontairesInfo, setVolontairesInfo] = useState<Record<number, VolontaireInfo>>({});

  const loadGroupesInfo = useCallback(async (groupeIds: number[]) => {
    if (!groupeIds || groupeIds.length === 0) return;

    try {
      const groupesData: Record<number, GroupeInfo> = {};
      const results = await Promise.allSettled(
        groupeIds.map(async (groupeId: number) => {
          if (!groupeId || groupesData[groupeId]) return null;
          const groupe = await groupeService.getById(groupeId);
          return { id: groupeId, data: groupe };
        })
      );

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.data) {
          const groupe = result.value.data;
          // Only add if groupe has a valid id
          if (groupe.id !== undefined) {
            groupesData[result.value.id] = { ...groupe, id: groupe.id };
          }
        }
      });

      setGroupesInfo((prev) => ({ ...prev, ...groupesData }));
    } catch (error) {
      console.error("Erreur lors du chargement des groupes:", error);
    }
  }, []);

  const loadVolontairesInfo = useCallback(async (volontaireIds: number[]) => {
    if (!volontaireIds || volontaireIds.length === 0) return;

    try {
      const volontairesData: Record<number, VolontaireInfo> = {};
      const results = await Promise.allSettled(
        volontaireIds.map(async (volontaireId: number) => {
          if (!volontaireId || volontairesData[volontaireId]) return null;
          const response = await volontaireService.getDetails(volontaireId);
          return { id: volontaireId, data: response.data };
        })
      );

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value?.data) {
          volontairesData[result.value.id] = result.value.data;
        }
      });

      setVolontairesInfo((prev) => ({ ...prev, ...volontairesData }));
    } catch (error) {
      console.error("Erreur lors du chargement des volontaires:", error);
    }
  }, []);

  return {
    groupesInfo,
    volontairesInfo,
    loadGroupesInfo,
    loadVolontairesInfo,
  };
};

// ===============================
// COMPOSANT PRINCIPAL
// ===============================

const IndemniteManager: React.FC<IndemniteManagerProps> = ({
  etudeId,
  etudeTitre,
  etudeRef,
  onError = () => { },
  showDebugInfo = false
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

  // Hooks personnalisés
  const { volontairesInfo, loadGroupesInfo, loadVolontairesInfo } = useEntitiesInfo();

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


  // Fonction pour annuler un volontaire : supprimer l'association et enregistrer l'annulation
  const changerStatutVersAnnule = useCallback(async (
    volontaire: VolontaireAssigne,
    commentaire: string,
    annulePar: 'COSMETEST' | 'VOLONTAIRE'
  ) => {
    const volontaireId = volontaire.idVolontaire;
    const statusKey = `${volontaireId}_annulation`;

    try {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "loading" }));

      console.log(`🔄 Début annulation volontaire ${volontaireId} pour étude ${etudeId} (par ${annulePar})`);

      // 1. Enregistrer l'annulation (le backend libère automatiquement les RDV)
      console.log(`📝 Enregistrement annulation (le backend va automatiquement libérer les créneaux RDV)...`);
      await enregistrerAnnulation(volontaire, commentaire, annulePar);
      console.log(`✅ Annulation enregistrée et créneaux RDV libérés automatiquement par le backend`);

      // 2. Supprimer l'association étude-volontaire
      console.log(`🔗 Suppression association étude-volontaire...`);
      const associationParams = {
        idEtude: parseInt(etudeId.toString()),
        idGroupe: volontaire.idGroupe || 0,
        idVolontaire: volontaire.idVolontaire,
        iv: volontaire.iv || 0,
        numsujet: volontaire.numsujet || 0,
        paye: volontaire.paye || 0,
        statut: volontaire.statut || "-",
      };

      await api.delete("/etude-volontaires/delete", { params: associationParams });
      console.log(`✅ Association supprimée`);

      // 4. Retirer le volontaire de la liste locale (il n'est plus associé à l'étude)
      setVolontairesAssignes((prev) => 
        prev.filter((v) =>
          !(v.idVolontaire === volontaireId &&
            v.idGroupe === (volontaire.idGroupe || 0))
        )
      );

      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      console.log(`✅ Annulation terminée avec succès`);
      setDebugInfo(`Volontaire annulé par ${annulePar} : association supprimée, RDV supprimés, annulation enregistrée. Commentaire: ${commentaire}`);

      setTimeout(() => {
        setUpdateStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[statusKey];
          return newStatus;
        });
      }, 2000);

    } catch (error: unknown) {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "error" }));
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as any).response?.data?.message || String(error)
        : error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur annulation: ${errorMessage}`);

      setTimeout(() => {
        setUpdateStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[statusKey];
          return newStatus;
        });
      }, 3000);
    }
  }, [etudeId, enregistrerAnnulation]);


  // Fonction générique de mise à jour (sans gestion automatique des annulations)
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

      const currentValue =
        field === "numsujet"
          ? volontaire.numsujet || 0
          : field === "iv"
            ? volontaire.iv || 0
            : volontaire.statut || "inscrit";

      if (newValue === currentValue) {
        setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
        setTimeout(() => {
          setUpdateStatus((prev) => {
            const newStatus = { ...prev };
            delete newStatus[statusKey];
            return newStatus;
          });
        }, 1000);
        return;
      }

      const baseParams = {
        idEtude: parseInt(etudeId.toString()),
        idGroupe: volontaire.idGroupe || 0,
        idVolontaire: volontaire.idVolontaire,
        iv: volontaire.iv || 0,
        numsujet: volontaire.numsujet || 0,
        paye: volontaire.paye || 0,
        statut: volontaire.statut || "-",
      };

      let params: UpdateParams = { ...baseParams };

      if (field === "statut") {
        params.nouveauStatut = newValue as string;
      } else if (field === "numsujet") {
        params.nouveauNumSujet = parseInt(newValue.toString()) || 0;
      } else if (field === "iv") {
        params.nouvelIV = parseInt(newValue.toString()) || 0;
      }

      await api.patch(endpoint, null, { params });

      setVolontairesAssignes((prev) => 
        prev.map((v) =>
          v.idVolontaire === volontaireId
            ? {
              ...v,
              [field]:
                field === "statut"
                  ? newValue
                  : parseInt(newValue.toString()) || 0,
            }
            : v
        )
      );

      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      setDebugInfo(`${field} mis à jour: ${currentValue} vers ${newValue}`);

      setTimeout(() => {
        setUpdateStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[statusKey];
          return newStatus;
        });
      }, 2000);
    } catch (error: unknown) {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "error" }));
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as any).response?.data?.message || String(error)
        : 'Erreur inconnue';
      setError(`Erreur ${field}: ${errorMessage}`);

      setTimeout(() => {
        setUpdateStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[statusKey];
          return newStatus;
        });
      }, 3000);
    }
  }, [etudeId]);

  // Fonction de suppression pour les volontaires avec ID = 0
  const deleteVolontaire = useCallback(async (volontaire: VolontaireAssigne) => {
    const volontaireId = volontaire.idVolontaire;
    const statusKey = `${volontaireId}_delete`;

    if (volontaireId !== 0) {
      setError("Seuls les volontaires avec ID = 0 peuvent être supprimés");
      return;
    }

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

      setVolontairesAssignes((prev) =>
        prev.filter((v) =>
          !(v.idVolontaire === volontaireId &&
            v.idGroupe === volontaire.idGroupe)
        )
      );

      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "success" }));
      setDebugInfo(`Volontaire ID=0 supprimé`);

      setTimeout(() => {
        setUpdateStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[statusKey];
          return newStatus;
        });
      }, 2000);
    } catch (error: unknown) {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "error" }));
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as any).response?.data?.message || String(error)
        : 'Erreur inconnue';
      setError(`Erreur suppression: ${errorMessage}`);

      setTimeout(() => {
        setUpdateStatus((prev) => {
          const newStatus = { ...prev };
          delete newStatus[statusKey];
          return newStatus;
        });
      }, 3000);
    }
  }, [etudeId]);

  // Fonctions spécialisées
  const updateStatut = useCallback((volontaire: VolontaireAssigne, nouveauStatut: string) => {
    return updateVolontaire(volontaire, "statut", nouveauStatut, "/etude-volontaires/update-statut");
  }, [updateVolontaire]);

  const updateIV = useCallback((volontaire: VolontaireAssigne, nouvelleIV: string | number) => {
    return updateVolontaire(volontaire, "iv", nouvelleIV, "/etude-volontaires/update-iv");
  }, [updateVolontaire]);

  const getVolontaireName = useMemo(
    () => (idVolontaire: number) => {
      if (!idVolontaire) return t('indemnity.volunteerNotAssigned');
      if (idVolontaire === 0) return t('indemnity.temporaryVolunteer');

      const volontaire = volontairesInfo[idVolontaire];
      if (!volontaire) return `${t('indemnity.volunteer')} #${idVolontaire}`;

      const prenom =
        volontaire.prenom ||
        volontaire.prenomVol ||
        volontaire.prenomVolontaire ||
        "";
      const nom =
        volontaire.nom || volontaire.nomVol || volontaire.nomVolontaire || "";

      if (prenom && nom) return `${prenom} ${nom}`;
      if (prenom) return prenom;
      if (nom) return nom;
      if (volontaire.nomComplet) return volontaire.nomComplet;

      return `${t('indemnity.volunteer')} #${idVolontaire}`;
    },
    [volontairesInfo]
  );

  // Fonction pour afficher le statut avec raison
  const getStatutDisplay = useCallback((statutComplet: string | null | undefined) => {
    const { statutBase, raison } = parseStatut(statutComplet);
    const config = getStatutConfig(statutBase);

    return {
      ...config,
      label: raison ? `${config.label} : ${raison}` : config.label,
      statutBase,
      raison
    };
  }, []);

  // Fonction pour obtenir nom et prénom séparément (pour le tri)
  const getVolontaireNomPrenom = useMemo(
    () => (idVolontaire: number): { nom: string; prenom: string } => {
      if (!idVolontaire || idVolontaire === 0) {
        return { nom: '', prenom: '' };
      }

      const volontaire = volontairesInfo[idVolontaire];
      if (!volontaire) {
        return { nom: '', prenom: '' };
      }

      const prenom = (
        volontaire.prenom ||
        volontaire.prenomVol ||
        volontaire.prenomVolontaire ||
        ""
      ).toLowerCase();

      const nom = (
        volontaire.nom ||
        volontaire.nomVol ||
        volontaire.nomVolontaire ||
        ""
      ).toLowerCase();

      return { nom, prenom };
    },
    [volontairesInfo]
  );

  // Liste triée des volontaires
  const volontairesTries = useMemo(() => {
    if (sortConfig.column === 'none') {
      return volontairesAssignes;
    }

    const sorted = [...volontairesAssignes].sort((a, b) => {
      let comparison = 0;

      if (sortConfig.column === 'nom') {
        // Trier par nom de famille d'abord, puis par prénom
        const volA = getVolontaireNomPrenom(a.idVolontaire);
        const volB = getVolontaireNomPrenom(b.idVolontaire);

        // Comparer d'abord par nom
        comparison = volA.nom.localeCompare(volB.nom, 'fr');

        // Si les noms sont identiques, comparer par prénom
        if (comparison === 0) {
          comparison = volA.prenom.localeCompare(volB.prenom, 'fr');
        }
      } else if (sortConfig.column === 'numsujet') {
        comparison = (a.numsujet || 0) - (b.numsujet || 0);
      } else if (sortConfig.column === 'iv') {
        comparison = (a.iv || 0) - (b.iv || 0);
      }

      return sortConfig.order === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [volontairesAssignes, sortConfig, getVolontaireNomPrenom]);

  // Fonction pour changer l'ordre de tri
  const handleSort = useCallback((column: 'nom' | 'numsujet' | 'iv') => {
    setSortConfig((prev) => {
      // Si on clique sur la même colonne, on change l'ordre
      if (prev.column === column) {
        return {
          column,
          order: prev.order === 'asc' ? 'desc' : 'asc'
        };
      }
      // Si on clique sur une nouvelle colonne, on commence par ordre croissant
      return { column, order: 'asc' };
    });
  }, []);

  // Statistiques calculées
  const statistics = useMemo(() => {
    // Tous les volontaires affichés sont actifs car les annulés sont supprimés de la liste
    return {
      totalIndemnites: volontairesAssignes.reduce((total, v) => total + (v.iv || 0), 0),
      moyenneIndemnite:
        volontairesAssignes.length > 0
          ? volontairesAssignes.reduce((total, v) => total + (v.iv || 0), 0) / volontairesAssignes.length
          : 0,
      nombreVolontaires: volontairesAssignes.length,
      volontairesTemporaires: volontairesAssignes.filter(v => v.idVolontaire === 0).length,
    };
  }, [volontairesAssignes]);

  // Chargement des données
  useEffect(() => {
    const fetchVolontaires = async () => {
      if (!etudeId) return;

      try {
        setIsLoading(true);
        const response = await etudeVolontaireService.getVolontairesByEtude(etudeId);

        let assignes: VolontaireAssigne[] = [];
        if (Array.isArray(response)) {
          assignes = response;
        } else if (response?.success && Array.isArray(response.data)) {
          assignes = response.data;
        } else if (response && Array.isArray(response.data)) {
          assignes = response.data;
        } else {
          console.warn("Format de réponse inattendu:", response);
          assignes = [];
        }

        setVolontairesAssignes(assignes);
        setDebugInfo(`${assignes.length} volontaires trouvés`);

        if (assignes.length > 0) {
          const uniqueGroupeIds = [
            ...new Set(
              assignes.map((v: VolontaireAssigne) => v.idGroupe).filter((id: number) => id && id !== 0)
            ),
          ] as number[];
          const uniqueVolontaireIds = [
            ...new Set(
              assignes.map((v: VolontaireAssigne) => v.idVolontaire).filter((id: number) => id && id !== 0)
            ),
          ] as number[];

          await Promise.all([
            loadGroupesInfo(uniqueGroupeIds),
            loadVolontairesInfo(uniqueVolontaireIds),
          ]);
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
  }, [etudeId, loadGroupesInfo, loadVolontairesInfo]);

  // Propager l'erreur au parent
  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  // Composant pour l'indicateur de statut
  const StatusIcon: React.FC<{ status?: 'loading' | 'success' | 'error' | 'cancelled' }> = ({ status }) => {
    switch (status) {
      case "loading":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
        );
      case "success":
        return <Check className="text-green-500 w-5 h-5" />;
      case "error":
        return <X className="text-red-500 w-5 h-5" />;
      case "cancelled":
        return <AlertTriangle className="text-orange-500 w-5 h-5" />;
      default:
        return null;
    }
  };

  // Composant pour l'input du numéro de sujet avec validation des doublons
  const NumSujetInput: React.FC<{ volontaire: VolontaireAssigne }> = ({ volontaire }) => {
    const [value, setValue] = useState(volontaire.numsujet?.toString() || "");
    const [localError, setLocalError] = useState("");

    const handleUpdate = (newValue: string) => {
      const numSujetValue = parseInt(newValue) || 0;

      // Vérifier si le numéro de sujet est déjà utilisé par un autre volontaire
      if (numSujetValue > 0) {
        const existingVolontaire = volontairesAssignes.find(
          (v) => v.numsujet === numSujetValue && v.idVolontaire !== volontaire.idVolontaire
        );

        if (existingVolontaire) {
          // Obtenir le nom du volontaire existant
          const volInfo = volontairesInfo[existingVolontaire.idVolontaire];
          let nomExistant = `Volontaire #${existingVolontaire.idVolontaire}`;
          if (volInfo) {
            const prenom = volInfo.prenom || volInfo.prenomVol || volInfo.prenomVolontaire || "";
            const nom = volInfo.nom || volInfo.nomVol || volInfo.nomVolontaire || "";
            if (prenom && nom) nomExistant = `${prenom} ${nom}`;
            else if (prenom) nomExistant = prenom;
            else if (nom) nomExistant = nom;
          }
          setLocalError(`N° ${numSujetValue} déjà attribué à ${nomExistant}`);
          // Réinitialiser à l'ancienne valeur après 3 secondes
          setTimeout(() => {
            setValue(volontaire.numsujet?.toString() || "");
            setLocalError("");
          }, 3000);
          return;
        }
      }

      setLocalError("");
      updateVolontaire(volontaire, "numsujet", newValue, "/etude-volontaires/update-numsujet");
    };

    return (
      <div className="relative">
        <div className="flex items-center space-x-2">
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={`w-20 ${localError ? "border-red-500 bg-red-50" : ""}`}
            min="1"
            title={localError || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdate(value);
              }
            }}
            onBlur={() => handleUpdate(value)}
          />
          <StatusIcon
            status={updateStatus[`${volontaire.idVolontaire}_numsujet`]}
          />
        </div>
        {localError && (
          <div className="absolute z-10 left-0 top-full mt-1 p-2 bg-red-100 border border-red-300 rounded shadow-lg max-w-[250px]">
            <p className="text-xs text-red-700 font-medium">{localError}</p>
          </div>
        )}
      </div>
    );
  };

  // Composant pour la gestion des annulations
  const AnnulationButton: React.FC<{ volontaire: VolontaireAssigne }> = ({ volontaire }) => {
    const [showForm, setShowForm] = useState(false);
    const [commentaire, setCommentaire] = useState("");
    const [annulePar, setAnnulePar] = useState<'COSMETEST' | 'VOLONTAIRE'>('COSMETEST');

    const handleAnnuler = async () => {
      if (!commentaire.trim()) {
        setError("Veuillez saisir un commentaire pour l'annulation");
        return;
      }

      await changerStatutVersAnnule(volontaire, commentaire.trim(), annulePar);
      setShowForm(false);
      setCommentaire("");
      setAnnulePar('COSMETEST');
    };

    if (volontaire.idVolontaire === 0) {
      return null; // Pas d'annulation pour les volontaires temporaires
    }

    if (showForm) {
      return (
        <div className="space-y-3 p-3 border border-red-300 rounded bg-red-50">
          <p className="text-xs font-medium text-red-800">
            {t('indemnity.cancelVolunteer')}
          </p>

          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <p>{t('indemnity.cancelWarning')}</p>
          </div>

          {/* Choix du type d'annulation */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">{t('indemnity.cancelledBy')}</p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="annulePar"
                  value="COSMETEST"
                  checked={annulePar === 'COSMETEST'}
                  onChange={(e) => setAnnulePar(e.target.value as 'COSMETEST' | 'VOLONTAIRE')}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm text-gray-700">{t('indemnity.cosmetest')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="annulePar"
                  value="VOLONTAIRE"
                  checked={annulePar === 'VOLONTAIRE'}
                  onChange={(e) => setAnnulePar(e.target.value as 'COSMETEST' | 'VOLONTAIRE')}
                  className="w-4 h-4 text-red-600"
                />
                <span className="text-sm text-gray-700">{t('indemnity.volunteer')}</span>
              </label>
            </div>
          </div>

          <Textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder={t('indemnity.cancelReasonPlaceholder')}
            className="w-full text-xs"
            rows={3}
            maxLength={200}
            autoFocus
          />

          <div className="text-xs text-gray-500">
            {commentaire.length}/200 {t('indemnity.characters')}
          </div>

          <div className="flex space-x-1">
            <Button
              onClick={handleAnnuler}
              disabled={!commentaire.trim()}
              variant="destructive"
              size="sm"
            >
              <Check className="w-4 h-4 mr-1" />
              {t('indemnity.confirmCancellation')}
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                setCommentaire("");
                setAnnulePar('COSMETEST');
              }}
              variant="secondary"
              size="sm"
            >
              <X className="w-4 h-4 mr-1" />
              {t('common.cancel')}
            </Button>
          </div>

          <div className="flex items-center justify-center">
            <StatusIcon status={updateStatus[`${volontaire.idVolontaire}_annulation`]} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Button
          onClick={() => setShowForm(true)}
          variant="destructive"
          size="sm"
          className="text-xs"
        >
          <UserX className="w-4 h-4 mr-1" />
          {t('common.cancel')}
        </Button>
      </div>
    );
  };

  // Composant pour le bouton de suppression
  const DeleteButton: React.FC<{ volontaire: VolontaireAssigne }> = ({ volontaire }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    if (volontaire.idVolontaire !== 0) {
      return null;
    }

    const handleDelete = async () => {
      await deleteVolontaire(volontaire);
      setShowConfirm(false);
    };

    if (showConfirm) {
      return (
        <div className="space-y-2">
          <p className="text-xs text-red-600">
            {t('indemnity.deleteConfirm')}
          </p>
          <div className="flex space-x-1">
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              <Check className="w-4 h-4 mr-1" />
              {t('common.delete')}
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="secondary"
              size="sm"
            >
              <X className="w-4 h-4 mr-1" />
              {t('common.cancel')}
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <StatusIcon status={updateStatus[`${volontaire.idVolontaire}_delete`]} />
          </div>
        </div>
      );
    }

    return (
      <Button
        onClick={() => setShowConfirm(true)}
        variant="outline"
        size="sm"
        className="text-xs"
      >
        <Trash2 className="w-4 h-4 mr-1" />
        {t('common.delete')}
      </Button>
    );
  };

  // Composant pour afficher et éditer le statut
  const StatutDisplay: React.FC<{ volontaire: VolontaireAssigne }> = ({ volontaire }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempStatut, setTempStatut] = useState(volontaire.statut || "inscrit");

    const statutDisplay = getStatutDisplay(volontaire.statut);

    const handleSaveStatut = async () => {
      if (tempStatut !== volontaire.statut) {
        await updateStatut(volontaire, tempStatut);
      }
      setIsEditing(false);
    };

    const handleCancelEdit = () => {
      setTempStatut(volontaire.statut || "inscrit");
      setIsEditing(false);
    };

    if (isEditing) {
      return (
        <div className="space-y-2">
          <Badge className={statutDisplay.style}>
            <StatutIcon iconName={statutDisplay.icon} className="w-3 h-3 mr-1" />
            {statutDisplay.label}
          </Badge>

          <div className="space-y-2">
            <Input
              type="text"
              value={tempStatut}
              onChange={(e) => setTempStatut(e.target.value)}
              placeholder="Ex: surbook, penalite : retard, parrainage"
              className="text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSaveStatut();
                }
                if (e.key === "Escape") {
                  handleCancelEdit();
                }
              }}
              autoFocus
            />

            <div className="flex flex-wrap gap-1">
              {Object.entries(STATUT_CONFIG)
                .filter(([key]) => key !== "annule") // Exclure "annule" des boutons rapides
                .map(([key, config]) => (
                  <Button
                    key={key}
                    type="button"
                    onClick={() => setTempStatut(key)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    title={`Utiliser: ${config.label}`}
                  >
                    <StatutIcon iconName={config.icon} className="w-3 h-3" />
                  </Button>
                ))}
            </div>

            <div className="flex space-x-1">
              <Button
                type="button"
                onClick={handleSaveStatut}
                variant="default"
                size="sm"
              >
                <Check className="w-4 h-4 mr-1" />
                {t('common.save')}
              </Button>
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="secondary"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                {t('common.cancel')}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <StatusIcon status={updateStatus[`${volontaire.idVolontaire}_statut`]} />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Badge className={statutDisplay.style}>
          <StatutIcon iconName={statutDisplay.icon} className="w-3 h-3 mr-1" />
          {statutDisplay.label}
        </Badge>

        <div className="flex space-x-2">
          <Button
            type="button"
            onClick={() => setIsEditing(true)}
            variant="link"
            size="sm"
            className="text-xs"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            {t('indemnity.modifyStatus')}
          </Button>
        </div>

        <div className="flex items-center justify-end">
          <StatusIcon status={updateStatus[`${volontaire.idVolontaire}_statut`]} />
        </div>
      </div>
    );
  };

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
          <p className="text-sm text-gray-600 mt-1">
            {etudeTitre} {etudeRef && `(${etudeRef})`}
          </p>
        </div>
      </div>

      {/* Messages d'erreur et debug */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setError("")}
            className="absolute top-2 right-2"
          >
            ×
          </Button>
        </Alert>
      )}

      {showDebugInfo && debugInfo && (
        <Alert>
          <AlertDescription>
            <strong>Debug:</strong> {debugInfo}
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDebugInfo("")}
            className="absolute top-2 right-2"
          >
            ×
          </Button>
        </Alert>
      )}

      {/* Alerte pour volontaires temporaires */}
      {statistics.volontairesTemporaires > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t('indemnity.temporaryVolunteerWarning', { count: statistics.volontairesTemporaires })}
          </AlertDescription>
        </Alert>
      )}


      {/* Info importante */}
      <Alert>
        <Save className="h-4 w-4" />
        <AlertDescription>
          {t('indemnity.autoSave')}
        </AlertDescription>
      </Alert>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Euro className="w-4 h-4" />
              {t('indemnity.totalIndemnities')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">
              {statistics.totalIndemnites.toFixed(0)} €
            </p>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {statistics.nombreVolontaires} {t('studies.volunteers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {t('indemnity.averagePerVolunteer')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-900">
              {statistics.moyenneIndemnite.toFixed(0)} €
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
              <Users className="w-4 h-4" />
              {t('indemnity.assignedVolunteers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-900">
              {statistics.nombreVolontaires}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t('indemnity.temporaryVolunteers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-900">
              {statistics.volontairesTemporaires}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des volontaires */}
      {statistics.nombreVolontaires === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {t('indemnity.noVolunteerAssigned')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('nom')}
                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    title={t('indemnity.sortByName')}
                  >
                    {t('indemnity.volunteer')}
                    {sortConfig.column !== 'nom' && <ArrowUpDown className="w-4 h-4" />}
                    {sortConfig.column === 'nom' && sortConfig.order === 'asc' && <ArrowUp className="w-4 h-4" />}
                    {sortConfig.column === 'nom' && sortConfig.order === 'desc' && <ArrowDown className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('numsujet')}
                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    title={t('indemnity.sortBySubjectNumber')}
                  >
                    {t('indemnity.subjectNumber')}
                    {sortConfig.column !== 'numsujet' && <ArrowUpDown className="w-4 h-4" />}
                    {sortConfig.column === 'numsujet' && sortConfig.order === 'asc' && <ArrowUp className="w-4 h-4" />}
                    {sortConfig.column === 'numsujet' && sortConfig.order === 'desc' && <ArrowDown className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('iv')}
                    className="flex items-center gap-2 hover:text-gray-700 transition-colors"
                    title={t('indemnity.sortByIndemnity')}
                  >
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
              {volontairesTries.map((volontaire) => (
                <tr key={`${volontaire.idVolontaire}-${volontaire.idGroupe}`}
                  className={`
                      ${volontaire.idVolontaire === 0 ? "bg-yellow-50" : ""}
                    `}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {getVolontaireName(volontaire.idVolontaire)}
                        {volontaire.idVolontaire === 0 && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                            {t('indemnity.temporary')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {volontaire.idVolontaire}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <NumSujetInput volontaire={volontaire} />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        defaultValue={volontaire.iv || 0}
                        className="w-24"
                        min="0"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateIV(volontaire, (e.target as HTMLInputElement).value);
                          }
                        }}
                        onBlur={(e) => {
                          updateIV(volontaire, e.target.value);
                        }}
                      />
                      <StatusIcon
                        status={updateStatus[`${volontaire.idVolontaire}_iv`]}
                      />
                    </div>
                  </td>


                  <td className="px-6 py-4">
                    <StatutDisplay volontaire={volontaire} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <AnnulationButton volontaire={volontaire} />
                      <DeleteButton volontaire={volontaire} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default IndemniteManager;