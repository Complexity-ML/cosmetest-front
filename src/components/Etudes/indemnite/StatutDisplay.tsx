import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Check, X } from "lucide-react";
import { STATUT_CONFIG, getStatutDisplay, StatutIcon, UpdateStatusIcon } from "./statutUtils";
import type { VolontaireAssigne, UpdateStatusMap } from "./types";

interface StatutDisplayProps {
  volontaire: VolontaireAssigne;
  updateStatus: UpdateStatusMap;
  onUpdateStatut: (volontaire: VolontaireAssigne, nouveauStatut: string) => Promise<void>;
}

const SORTIE_STATUTS = ["sortie_etude", "ni", "penalite"];

const StatutDisplay: React.FC<StatutDisplayProps> = ({ volontaire, updateStatus, onUpdateStatut }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [tempStatut, setTempStatut] = useState(volontaire.statut || "inscrit");
  const inputRef = useRef<HTMLInputElement>(null);

  const statutDisplay = getStatutDisplay(volontaire.statut);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleSelectStatut = (key: string) => {
    if (SORTIE_STATUTS.includes(key)) {
      setTempStatut(`${key} : `);
    } else {
      setTempStatut(key);
    }
  };

  const handleSaveStatut = async () => {
    const finalStatut = tempStatut.trim();
    if (finalStatut !== volontaire.statut) {
      await onUpdateStatut(volontaire, finalStatut);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempStatut(volontaire.statut || "inscrit");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
        <Badge className={statutDisplay.style}>
          <StatutIcon iconName={statutDisplay.icon} className="w-3 h-3 mr-1" />
          {statutDisplay.label}
        </Badge>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {Object.entries(STATUT_CONFIG)
              .filter(([key]) => key !== "annule")
              .map(([key, config]) => (
                <Button
                  key={key}
                  type="button"
                  onClick={() => handleSelectStatut(key)}
                  variant={tempStatut === key || tempStatut.startsWith(`${key} : `) ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  title={`Utiliser: ${config.label}`}
                >
                  <StatutIcon iconName={config.icon} className="w-3 h-3 mr-1" />
                  {config.label}
                </Button>
              ))}
          </div>

          <Input
            ref={inputRef}
            type="text"
            value={tempStatut}
            onChange={(e) => setTempStatut(e.target.value)}
            placeholder="Saisir un statut..."
            className="text-xs"
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); handleSaveStatut(); }
              if (e.key === "Escape") handleCancelEdit();
            }}
          />

          <div className="flex space-x-1">
            <Button type="button" onClick={handleSaveStatut} variant="default" size="sm">
              <Check className="w-4 h-4 mr-1" />
              {t('common.save')}
            </Button>
            <Button type="button" onClick={handleCancelEdit} variant="secondary" size="sm">
              <X className="w-4 h-4 mr-1" />
              {t('common.cancel')}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <UpdateStatusIcon status={updateStatus[`${volontaire.idVolontaire}_statut`]} />
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
          onClick={() => {
            setTempStatut(volontaire.statut || "inscrit");
            setIsEditing(true);
          }}
          variant="link"
          size="sm"
          className="text-xs"
        >
          <Edit2 className="w-3 h-3 mr-1" />
          {t('indemnity.modifyStatus')}
        </Button>
      </div>

      <div className="flex items-center justify-end">
        <UpdateStatusIcon status={updateStatus[`${volontaire.idVolontaire}_statut`]} />
      </div>
    </div>
  );
};

export default StatutDisplay;
