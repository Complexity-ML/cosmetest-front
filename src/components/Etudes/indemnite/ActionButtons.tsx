import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, Check, X, UserX, Trash2 } from "lucide-react";
import { UpdateStatusIcon } from "./statutUtils";
import type { VolontaireAssigne, UpdateStatusMap } from "./types";

// Bouton d'annulation
interface AnnulationButtonProps {
  volontaire: VolontaireAssigne;
  updateStatus: UpdateStatusMap;
  getVolontaireKey: (volontaire: VolontaireAssigne) => string;
  onAnnuler: (volontaire: VolontaireAssigne, commentaire: string, annulePar: 'COSMETEST' | 'VOLONTAIRE') => Promise<void>;
}

export const AnnulationButton: React.FC<AnnulationButtonProps> = ({ volontaire, updateStatus, getVolontaireKey, onAnnuler }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [commentaire, setCommentaire] = useState("");
  const [annulePar, setAnnulePar] = useState<'COSMETEST' | 'VOLONTAIRE'>('COSMETEST');
  const volontaireKey = getVolontaireKey(volontaire);

  const handleAnnuler = async () => {
    if (!commentaire.trim()) return;
    await onAnnuler(volontaire, commentaire.trim(), annulePar);
    setShowForm(false);
    setCommentaire("");
    setAnnulePar('COSMETEST');
  };

  if (volontaire.idVolontaire === 0) return null;

  if (showForm) {
    return (
      <div className="space-y-3 p-3 border border-red-300 rounded bg-red-50">
        <p className="text-xs font-medium text-red-800">{t('indemnity.cancelVolunteer')}</p>
        <div className="flex items-center gap-2 text-xs text-red-600">
          <AlertTriangle className="w-4 h-4" />
          <p>{t('indemnity.cancelWarning')}</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">{t('indemnity.cancelledBy')}</p>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`annulePar-${volontaireKey}`} value="COSMETEST" checked={annulePar === 'COSMETEST'} onChange={(e) => setAnnulePar(e.target.value as 'COSMETEST' | 'VOLONTAIRE')} className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-700">{t('indemnity.cosmetest')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name={`annulePar-${volontaireKey}`} value="VOLONTAIRE" checked={annulePar === 'VOLONTAIRE'} onChange={(e) => setAnnulePar(e.target.value as 'COSMETEST' | 'VOLONTAIRE')} className="w-4 h-4 text-red-600" />
              <span className="text-sm text-gray-700">{t('indemnity.volunteer')}</span>
            </label>
          </div>
        </div>
        <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder={t('indemnity.cancelReasonPlaceholder')} className="w-full text-xs" rows={3} maxLength={200} autoFocus />
        <div className="text-xs text-gray-500">{commentaire.length}/200 {t('indemnity.characters')}</div>
        <div className="flex space-x-1">
          <Button onClick={handleAnnuler} disabled={!commentaire.trim()} variant="destructive" size="sm">
            <Check className="w-4 h-4 mr-1" />{t('indemnity.confirmCancellation')}
          </Button>
          <Button onClick={() => { setShowForm(false); setCommentaire(""); setAnnulePar('COSMETEST'); }} variant="secondary" size="sm">
            <X className="w-4 h-4 mr-1" />{t('common.cancel')}
          </Button>
        </div>
        <div className="flex items-center justify-center">
          <UpdateStatusIcon status={updateStatus[`${volontaireKey}_annulation`]} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={() => setShowForm(true)} variant="destructive" size="sm" className="text-xs">
        <UserX className="w-4 h-4 mr-1" />{t('common.cancel')}
      </Button>
    </div>
  );
};

// Bouton de suppression (pour ID=0)
interface DeleteButtonProps {
  volontaire: VolontaireAssigne;
  updateStatus: UpdateStatusMap;
  getVolontaireKey: (volontaire: VolontaireAssigne) => string;
  onDelete: (volontaire: VolontaireAssigne) => Promise<void>;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ volontaire, updateStatus, getVolontaireKey, onDelete }) => {
  const { t } = useTranslation();
  const [showConfirm, setShowConfirm] = useState(false);

  if (volontaire.idVolontaire !== 0) return null;

  const handleDelete = async () => {
    await onDelete(volontaire);
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-red-600">{t('indemnity.deleteConfirm')}</p>
        <div className="flex space-x-1">
          <Button onClick={handleDelete} variant="destructive" size="sm">
            <Check className="w-4 h-4 mr-1" />{t('common.delete')}
          </Button>
          <Button onClick={() => setShowConfirm(false)} variant="secondary" size="sm">
            <X className="w-4 h-4 mr-1" />{t('common.cancel')}
          </Button>
        </div>
        <div className="flex items-center justify-center">
          <UpdateStatusIcon status={updateStatus[`${getVolontaireKey(volontaire)}_delete`]} />
        </div>
      </div>
    );
  }

  return (
    <Button onClick={() => setShowConfirm(true)} variant="outline" size="sm" className="text-xs">
      <Trash2 className="w-4 h-4 mr-1" />{t('common.delete')}
    </Button>
  );
};
