// ============================================================
// IndemniteManager.tsx - Version avec bouton d'annulation dédié
// ============================================================

import { useState, useEffect, useCallback, useMemo } from "react";
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
  FileText
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
  // États
  const [volontairesAssignes, setVolontairesAssignes] = useState<VolontaireAssigne[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusMap>({});

  // Hooks personnalisés
  const { volontairesInfo, loadGroupesInfo, loadVolontairesInfo } = useEntitiesInfo();

  // Fonctions de gestion des annulations
  const enregistrerAnnulation = useCallback(async (volontaire: VolontaireAssigne, commentaire: string = "") => {
    try {
      const annulationData = {
        idVol: volontaire.idVolontaire,
        idEtude: parseInt(etudeId.toString()),
        dateAnnulation: new Date().toISOString().split('T')[0],
        commentaire: commentaire || `Annulation manuelle`
      };

      await annulationService.createWithValidation(annulationData);
      setDebugInfo(`Annulation enregistrée pour le volontaire ${volontaire.idVolontaire}`);
    } catch (error: unknown) {
      console.error("Erreur lors de l'enregistrement de l'annulation:", error);
      const errorMessage = error && typeof error === 'object' && 'response' in error 
        ? (error as any).response?.data?.message || String(error)
        : error instanceof Error ? error.message : 'Erreur inconnue';
      setError(`Erreur lors de l'enregistrement de l'annulation: ${errorMessage}`);
    }
  }, [etudeId]);


  // Fonction pour annuler un volontaire : supprimer l'association et enregistrer l'annulation
  const changerStatutVersAnnule = useCallback(async (volontaire: VolontaireAssigne, commentaire: string) => {
    const volontaireId = volontaire.idVolontaire;
    const statusKey = `${volontaireId}_annulation`;

    try {
      setUpdateStatus((prev) => ({ ...prev, [statusKey]: "loading" }));

      console.log(`🔄 Début annulation volontaire ${volontaireId} pour étude ${etudeId}`);

      // 1. Enregistrer l'annulation (le backend libère automatiquement les RDV)
      console.log(`📝 Enregistrement annulation (le backend va automatiquement libérer les créneaux RDV)...`);
      await enregistrerAnnulation(volontaire, commentaire);
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
      setDebugInfo(`Volontaire annulé : association supprimée, RDV supprimés, annulation enregistrée. Commentaire: ${commentaire}`);

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

  const updateNumSujet = useCallback((volontaire: VolontaireAssigne, nouveauNumSujet: string | number) => {
    return updateVolontaire(volontaire, "numsujet", nouveauNumSujet, "/etude-volontaires/update-numsujet");
  }, [updateVolontaire]);

  const updateIV = useCallback((volontaire: VolontaireAssigne, nouvelleIV: string | number) => {
    return updateVolontaire(volontaire, "iv", nouvelleIV, "/etude-volontaires/update-iv");
  }, [updateVolontaire]);

  const getVolontaireName = useMemo(
    () => (idVolontaire: number) => {
      if (!idVolontaire) return "Volontaire non assigné";
      if (idVolontaire === 0) return "Volontaire temporaire";

      const volontaire = volontairesInfo[idVolontaire];
      if (!volontaire) return `Volontaire #${idVolontaire}`;

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

      return `Volontaire #${idVolontaire}`;
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

  // Composant pour la gestion des annulations
  const AnnulationButton: React.FC<{ volontaire: VolontaireAssigne }> = ({ volontaire }) => {
    const [showForm, setShowForm] = useState(false);
    const [commentaire, setCommentaire] = useState("");

    const handleAnnuler = async () => {
      if (!commentaire.trim()) {
        setError("Veuillez saisir un commentaire pour l'annulation");
        return;
      }

      await changerStatutVersAnnule(volontaire, commentaire.trim());
      setShowForm(false);
      setCommentaire("");
    };

    if (volontaire.idVolontaire === 0) {
      return null; // Pas d'annulation pour les volontaires temporaires
    }

    if (showForm) {
      return (
        <div className="space-y-2 p-2 border border-red-300 rounded bg-red-50">
          <p className="text-xs font-medium text-red-800">
            Annuler le volontaire
          </p>

          <div className="flex items-center gap-2 text-xs text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <p>Le volontaire sera retiré de l'étude ET de tous ses créneaux de RDV.</p>
          </div>

          <Textarea
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Raison de l'annulation (obligatoire)..."
            className="w-full text-xs"
            rows={3}
            maxLength={200}
            autoFocus
          />

          <div className="text-xs text-gray-500">
            {commentaire.length}/200 caractères
          </div>

          <div className="flex space-x-1">
            <Button
              onClick={handleAnnuler}
              disabled={!commentaire.trim()}
              variant="destructive"
              size="sm"
            >
              <Check className="w-4 h-4 mr-1" />
              Confirmer l'annulation
            </Button>
            <Button
              onClick={() => {
                setShowForm(false);
                setCommentaire("");
              }}
              variant="secondary"
              size="sm"
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
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
          Annuler
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
            Confirmer la suppression ?
          </p>
          <div className="flex space-x-1">
            <Button
              onClick={handleDelete}
              variant="destructive"
              size="sm"
            >
              <Check className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
            <Button
              onClick={() => setShowConfirm(false)}
              variant="secondary"
              size="sm"
            >
              <X className="w-4 h-4 mr-1" />
              Annuler
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
        Supprimer
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
                Sauver
              </Button>
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="secondary"
                size="sm"
              >
                <X className="w-4 h-4 mr-1" />
                Annuler
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
            Modifier statut
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
          <h3 className="text-xl font-semibold text-gray-900">Gestion des Indemnités</h3>
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
            <strong>Attention :</strong> {statistics.volontairesTemporaires} volontaire(s) temporaire(s) (ID=0) détecté(s).
            Vous pouvez les supprimer en cliquant sur le bouton "Supprimer" dans la colonne Actions.
          </AlertDescription>
        </Alert>
      )}


      {/* Info importante */}
      <Alert>
        <Save className="h-4 w-4" />
        <AlertDescription>
          <strong>Sauvegarde automatique :</strong> Toutes les modifications (statut, indemnité, numéro sujet) sont sauvegardées automatiquement dès que vous les validez.
        </AlertDescription>
      </Alert>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Total des indemnités
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-900">
              {statistics.totalIndemnites.toFixed(0)} €
            </p>
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {statistics.nombreVolontaires} volontaires
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Moyenne par volontaire
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
              Volontaires assignés
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
              Volontaires temporaires
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
            Aucun volontaire assigné à cette étude
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volontaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro sujet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Indemnité (€)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {volontairesAssignes.map((volontaire, index) => (
                <tr key={`${volontaire.idVolontaire}-${index}`}
                  className={`
                      ${volontaire.idVolontaire === 0 ? "bg-yellow-50" : ""}
                    `}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">
                        {getVolontaireName(volontaire.idVolontaire)}
                        {volontaire.idVolontaire === 0 && (
                          <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                            TEMPORAIRE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {volontaire.idVolontaire}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        defaultValue={volontaire.numsujet || ""}
                        className="w-20"
                        min="1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            updateNumSujet(volontaire, (e.target as HTMLInputElement).value);
                          }
                        }}
                        onBlur={(e) => {
                          updateNumSujet(volontaire, e.target.value);
                        }}
                      />
                      <StatusIcon
                        status={updateStatus[`${volontaire.idVolontaire}_numsujet`]}
                      />
                    </div>
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