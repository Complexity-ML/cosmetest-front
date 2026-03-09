import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Euro, FileText, Check, X, Loader2, Settings2 } from "lucide-react";
import { STATUT_CONFIG, StatutIcon } from "./statutUtils";
import type { VolontaireAssigne } from "./types";

interface BatchActionsProps {
  selectedIds: Set<number>;
  volontaires: VolontaireAssigne[];
  onBatchUpdateIV: (ids: number[], newIV: number) => Promise<void>;
  onBatchUpdateStatut: (ids: number[], newStatut: string) => Promise<void>;
  onClearSelection: () => void;
}

// Statuts de sortie qui nécessitent une note
const SORTIE_STATUTS = ["sortie_etude", "ni", "penalite"];

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
  const [showComboForm, setShowComboForm] = useState(false);
  const [batchIV, setBatchIV] = useState("");
  const [batchStatut, setBatchStatut] = useState("");
  const [batchNote, setBatchNote] = useState("");
  const [comboIV, setComboIV] = useState("");
  const [comboStatut, setComboStatut] = useState("");
  const [comboNote, setComboNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  if (selectedIds.size === 0) return null;

  const closeAll = () => {
    setShowIVForm(false);
    setShowStatutForm(false);
    setShowComboForm(false);
    setBatchIV("");
    setBatchStatut("");
    setBatchNote("");
    setComboIV("");
    setComboStatut("");
    setComboNote("");
  };

  const buildStatutWithNote = (statut: string, note: string) => {
    if (note.trim()) return `${statut} : ${note.trim()}`;
    return statut;
  };

  const handleBatchIV = async () => {
    const ivValue = parseInt(batchIV);
    if (isNaN(ivValue) || ivValue < 0) return;
    setIsUpdating(true);
    try {
      await onBatchUpdateIV(Array.from(selectedIds), ivValue);
      closeAll();
      onClearSelection();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBatchStatut = async () => {
    const finalStatut = buildStatutWithNote(batchStatut, batchNote);
    if (!finalStatut.trim()) return;
    setIsUpdating(true);
    try {
      await onBatchUpdateStatut(Array.from(selectedIds), finalStatut);
      closeAll();
      onClearSelection();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCombo = async () => {
    const ivValue = parseInt(comboIV);
    const finalStatut = buildStatutWithNote(comboStatut, comboNote);
    if ((isNaN(ivValue) || ivValue < 0) && !finalStatut.trim()) return;
    setIsUpdating(true);
    try {
      const ids = Array.from(selectedIds);
      if (!isNaN(ivValue) && ivValue >= 0) {
        await onBatchUpdateIV(ids, ivValue);
      }
      if (finalStatut.trim()) {
        await onBatchUpdateStatut(ids, finalStatut);
      }
      closeAll();
      onClearSelection();
    } finally {
      setIsUpdating(false);
    }
  };

  const isSortieStatut = (statut: string) => SORTIE_STATUTS.includes(statut);

  const renderStatutButtons = (
    currentStatut: string,
    onSelect: (key: string) => void,
    noteValue: string,
    onNoteChange: (val: string) => void
  ) => (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {Object.entries(STATUT_CONFIG)
          .filter(([key]) => key !== "annule")
          .map(([key, config]) => (
            <Button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              variant={currentStatut === key ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              <StatutIcon iconName={config.icon} className="w-3 h-3 mr-1" />
              {config.label}
            </Button>
          ))}
      </div>
      {isSortieStatut(currentStatut) && (
        <Input
          type="text"
          value={noteValue}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={`Note pour ${STATUT_CONFIG[currentStatut]?.label || currentStatut}...`}
          className="text-xs"
          autoFocus
        />
      )}
    </div>
  );

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">
          <strong>{selectedIds.size}</strong> volontaire{selectedIds.size > 1 ? 's' : ''} sélectionné{selectedIds.size > 1 ? 's' : ''}
        </span>
        <div className="flex gap-2">
          {!showIVForm && !showStatutForm && !showComboForm && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { closeAll(); setShowIVForm(true); }}
                className="text-xs"
              >
                <Euro className="w-3 h-3 mr-1" />
                {t('indemnity.changeIV') || 'Changer IV'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { closeAll(); setShowStatutForm(true); }}
                className="text-xs"
              >
                <FileText className="w-3 h-3 mr-1" />
                {t('indemnity.changeStatus') || 'Changer statut'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { closeAll(); setShowComboForm(true); }}
                className="text-xs bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Settings2 className="w-3 h-3 mr-1" />
                IV + Statut
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
            onKeyDown={(e) => { if (e.key === "Enter") handleBatchIV(); if (e.key === "Escape") closeAll(); }}
          />
          <span className="text-sm text-gray-500">€</span>
          <Button size="sm" onClick={handleBatchIV} disabled={isUpdating || !batchIV}>
            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            {t('common.apply') || 'Appliquer'}
          </Button>
          <Button size="sm" variant="ghost" onClick={closeAll}>
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
          {renderStatutButtons(batchStatut, setBatchStatut, batchNote, setBatchNote)}
          <div className="flex items-center gap-2">
            {!isSortieStatut(batchStatut) && (
              <Input
                type="text"
                value={batchStatut}
                onChange={(e) => setBatchStatut(e.target.value)}
                placeholder="Ou saisir un statut libre..."
                className="text-xs flex-1"
                onKeyDown={(e) => { if (e.key === "Enter") handleBatchStatut(); if (e.key === "Escape") closeAll(); }}
              />
            )}
            <Button size="sm" onClick={handleBatchStatut} disabled={isUpdating || !batchStatut.trim()}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              {t('common.apply') || 'Appliquer'}
            </Button>
            <Button size="sm" variant="ghost" onClick={closeAll}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Formulaire combo IV + Statut */}
      {showComboForm && (
        <div className="bg-white p-3 rounded border space-y-3">
          <span className="text-sm font-medium text-purple-700">
            Modifier IV et statut pour {selectedIds.size} volontaire{selectedIds.size > 1 ? 's' : ''}
          </span>

          {/* IV */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 whitespace-nowrap">IV :</span>
            <Input
              type="number"
              value={comboIV}
              onChange={(e) => setComboIV(e.target.value)}
              className="w-24"
              min="0"
              placeholder="€"
              autoFocus
            />
            <span className="text-sm text-gray-500">€</span>
          </div>

          {/* Statut */}
          <div className="space-y-1">
            <span className="text-sm text-gray-700">Statut :</span>
            {renderStatutButtons(comboStatut, setComboStatut, comboNote, setComboNote)}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleCombo}
              disabled={isUpdating || (!comboIV && !comboStatut.trim())}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
              {t('common.apply') || 'Appliquer'}
            </Button>
            <Button size="sm" variant="ghost" onClick={closeAll}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchActions;
