import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Euro, FileText, Check, X, Loader2 } from "lucide-react";
import { STATUT_CONFIG, StatutIcon } from "./statutUtils";
import type { VolontaireAssigne } from "./types";

interface BatchActionsProps {
  selectedIds: Set<number>;
  volontaires: VolontaireAssigne[];
  onBatchUpdateIV: (ids: number[], newIV: number) => Promise<void>;
  onBatchUpdateStatut: (ids: number[], newStatut: string) => Promise<void>;
  onClearSelection: () => void;
}

const BatchActions: React.FC<BatchActionsProps> = ({
  selectedIds,
  volontaires,
  onBatchUpdateIV,
  onBatchUpdateStatut,
  onClearSelection,
}) => {
  const { t } = useTranslation();
  const [showIVForm, setShowIVForm] = useState(false);
  const [showStatutForm, setShowStatutForm] = useState(false);
  const [batchIV, setBatchIV] = useState("");
  const [batchStatut, setBatchStatut] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (selectedIds.size === 0) return null;

  const handleBatchIV = async () => {
    const ivValue = parseInt(batchIV);
    if (isNaN(ivValue) || ivValue < 0) return;
    setIsUpdating(true);
    try {
      await onBatchUpdateIV(Array.from(selectedIds), ivValue);
      setShowIVForm(false);
      setBatchIV("");
      onClearSelection();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBatchStatut = async () => {
    if (!batchStatut.trim()) return;
    setIsUpdating(true);
    try {
      await onBatchUpdateStatut(Array.from(selectedIds), batchStatut);
      setShowStatutForm(false);
      setBatchStatut("");
      onClearSelection();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">
          <strong>{selectedIds.size}</strong> volontaire{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          {!showIVForm && !showStatutForm && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowIVForm(true); setShowStatutForm(false); }}
                className="text-xs"
              >
                <Euro className="w-3 h-3 mr-1" />
                {t('indemnity.changeIV') || 'Changer IV'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowStatutForm(true); setShowIVForm(false); }}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                {t('indemnity.changeStatus') || 'Changer statut'}
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" onClick={onClearSelection} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            {t('appointments.deselectAll') || 'Désélectionner'}
          </Button>
        </div>
      </div>

      {/* Formulaire batch IV */}
      {showIVForm && (
        <div className="flex items-center gap-2 bg-white p-3 rounded border">
          <span className="text-sm text-gray-700 whitespace-nowrap">
            {t('indemnity.newIVFor') || 'Nouvelle IV pour'} {selectedIds.size} volontaire{selectedIds.size > 1 ? 's' : ''} :
          </span>
          <Input
            type="number"
            value={batchIV}
            onChange={(e) => setBatchIV(e.target.value)}
            className="w-24"
            min="0"
            placeholder="€"
            autoFocus
            onKeyDown={(e) => { if (e.key === "Enter") handleBatchIV(); if (e.key === "Escape") { setShowIVForm(false); setBatchIV(""); } }}
          />
          <span className="text-sm text-gray-500">€</span>
          <Button size="sm" onClick={handleBatchIV} disabled={isUpdating || !batchIV}>
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            {t('common.apply') || 'Appliquer'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { setShowIVForm(false); setBatchIV(""); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Formulaire batch statut */}
      {showStatutForm && (
        <div className="bg-white p-3 rounded border space-y-2">
          <span className="text-sm text-gray-700">
            {t('indemnity.newStatusFor') || 'Nouveau statut pour'} {selectedIds.size} volontaire{selectedIds.size > 1 ? 's' : ''} :
          </span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(STATUT_CONFIG)
              .filter(([key]) => key !== "annule")
              .map(([key, config]) => (
                <Button
                  key={key}
                  type="button"
                  onClick={() => setBatchStatut(key)}
                  variant={batchStatut === key ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                >
                  <StatutIcon iconName={config.icon} className="w-3 h-3 mr-1" />
                  {config.label}
                </Button>
              ))}
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={batchStatut}
              onChange={(e) => setBatchStatut(e.target.value)}
              placeholder="Ex: surbook, penalite : retard..."
              className="text-xs flex-1"
              onKeyDown={(e) => { if (e.key === "Enter") handleBatchStatut(); if (e.key === "Escape") { setShowStatutForm(false); setBatchStatut(""); } }}
            />
            <Button size="sm" onClick={handleBatchStatut} disabled={isUpdating || !batchStatut.trim()}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              {t('common.apply') || 'Appliquer'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowStatutForm(false); setBatchStatut(""); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchActions;
