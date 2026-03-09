import React from "react";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  XCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";
import type { StatutConfigItem } from "./types";

export const STATUT_CONFIG: Record<string, StatutConfigItem> = {
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
  etude_et_parrainage: {
    label: "Étude et Parrainage",
    icon: "FileText",
    style: "bg-purple-100 text-purple-800 border-purple-300",
  },
  sortie_etude: {
    label: "Sortie étude",
    icon: "XCircle",
    style: "bg-red-100 text-red-800 border-red-300",
  },
  ni: {
    label: "NI",
    icon: "XCircle",
    style: "bg-red-100 text-red-800 border-red-300",
  },
  annule: {
    label: "Annulé",
    icon: "XCircle",
    style: "bg-gray-100 text-gray-800 border-gray-300",
  },
};

export const normalizeStatut = (statut: string | null | undefined): string => {
  if (!statut || statut === "" || statut === "-" || statut === null || statut === undefined) {
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

export const getStatutConfig = (statut: string | null | undefined): StatutConfigItem => {
  const normalized = normalizeStatut(statut);
  return (
    STATUT_CONFIG[normalized] || {
      label: `${statut} (non reconnu)`,
      icon: "❓",
      style: "bg-gray-100 text-gray-800 border-gray-300",
    }
  );
};

export const parseStatut = (statutComplet: string | null | undefined): { statutBase: string; raison: string } => {
  if (!statutComplet) return { statutBase: "inscrit", raison: "" };
  const statut = statutComplet.toString().trim();
  if (statut.includes(" : ")) {
    const [statutBase, ...raisonParts] = statut.split(" : ");
    return {
      statutBase: normalizeStatut(statutBase.trim()),
      raison: raisonParts.join(" : ").trim()
    };
  }
  return { statutBase: normalizeStatut(statut), raison: "" };
};

export const getStatutDisplay = (statutComplet: string | null | undefined) => {
  const { statutBase, raison } = parseStatut(statutComplet);
  const config = getStatutConfig(statutBase);
  return {
    ...config,
    label: raison ? `${config.label} : ${raison}` : config.label,
    statutBase,
    raison
  };
};

export const StatutIcon: React.FC<{ iconName: string; className?: string }> = ({ iconName, className = "w-4 h-4" }) => {
  const icons: Record<string, React.ReactNode> = {
    FileText: <FileText className={className} />,
    TrendingUp: <TrendingUp className={className} />,
    AlertTriangle: <AlertTriangle className={className} />,
    XCircle: <XCircle className={className} />,
  };
  return <>{icons[iconName] || <AlertCircle className={className} />}</>;
};

export const UpdateStatusIcon: React.FC<{ status?: 'loading' | 'success' | 'error' | 'cancelled' }> = ({ status }) => {
  switch (status) {
    case "loading":
      return <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>;
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
