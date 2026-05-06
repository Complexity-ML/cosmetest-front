import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { UpdateStatusIcon } from "./statutUtils";
import type { VolontaireAssigne, VolontaireInfo, UpdateStatusMap } from "./types";

interface NumSujetInputProps {
  volontaire: VolontaireAssigne;
  volontairesAssignes: VolontaireAssigne[];
  volontairesInfo: Record<number, VolontaireInfo>;
  updateStatus: UpdateStatusMap;
  onUpdate: (volontaire: VolontaireAssigne, field: 'numsujet', value: string, endpoint: string) => Promise<void>;
}

export const NumSujetInput: React.FC<NumSujetInputProps> = ({
  volontaire,
  volontairesAssignes,
  volontairesInfo,
  updateStatus,
  onUpdate
}) => {
  const [value, setValue] = useState(volontaire.numsujet?.toString() || "");
  const [localError, setLocalError] = useState("");
  const isSavingRef = useRef(false);
  const lastSavedValueRef = useRef(volontaire.numsujet?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFocusRef = useRef(false);
  const pendingValueRef = useRef<string | null>(null);

  useEffect(() => {
    const propValue = volontaire.numsujet?.toString() || "";
    if (!hasFocusRef.current && !isSavingRef.current && pendingValueRef.current === null && propValue !== lastSavedValueRef.current) {
      setValue(propValue);
      lastSavedValueRef.current = propValue;
    }
  }, [volontaire.numsujet]);

  const handleUpdate = async (newValue: string) => {
    if (isSavingRef.current) {
      pendingValueRef.current = newValue;
      return;
    }
    const numSujetValue = parseInt(newValue) || 0;
    const currentSavedValue = parseInt(lastSavedValueRef.current) || 0;
    if (numSujetValue === currentSavedValue) {
      pendingValueRef.current = null;
      return;
    }
    if (numSujetValue > 0) {
      const existingVolontaire = volontairesAssignes.find(
        (v) => v.numsujet === numSujetValue && v.idVolontaire !== volontaire.idVolontaire
      );
      if (existingVolontaire) {
        const volInfo = volontairesInfo[existingVolontaire.idVolontaire];
        let nomExistant = `Volontaire #${existingVolontaire.idVolontaire}`;
        if (volInfo) {
          const prenom = volInfo.prenom || volInfo.prenomVol || volInfo.prenomVolontaire || "";
          const nom = volInfo.nom || volInfo.nomVol || volInfo.nomVolontaire || "";
          if (prenom && nom) nomExistant = `${nom} ${prenom}`;
          else if (prenom) nomExistant = prenom;
          else if (nom) nomExistant = nom;
        }
        setLocalError(`N° ${numSujetValue} déjà attribué à ${nomExistant}`);
        pendingValueRef.current = null;
        setTimeout(() => {
          setValue(lastSavedValueRef.current);
          setLocalError("");
        }, 3000);
        return;
      }
    }
    setLocalError("");
    isSavingRef.current = true;
    pendingValueRef.current = newValue;
    try {
      await onUpdate(volontaire, "numsujet", newValue, "/etude-volontaires/update-numsujet");
      lastSavedValueRef.current = newValue;
    } finally {
      isSavingRef.current = false;
      pendingValueRef.current = null;
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <Input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => {
            const rawValue = e.target.value;
            const normalizedValue = rawValue === '' ? '' : String(parseInt(rawValue) || 0);
            setValue(normalizedValue);
          }}
          className={`w-20 ${localError ? "border-red-500 bg-red-50" : ""}`}
          min="1"
          title={localError || ""}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onFocus={(e) => { hasFocusRef.current = true; e.target.select(); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(value); }}
          onBlur={() => {
            const valueToSave = value;
            pendingValueRef.current = valueToSave;
            hasFocusRef.current = false;
            handleUpdate(valueToSave);
          }}
        />
        <UpdateStatusIcon status={updateStatus[`${volontaire.idVolontaire}_numsujet`]} />
      </div>
      {localError && (
        <div className="absolute z-10 left-0 top-full mt-1 p-2 bg-red-100 border border-red-300 rounded shadow-lg max-w-[250px]">
          <p className="text-xs text-red-700 font-medium">{localError}</p>
        </div>
      )}
    </div>
  );
};

interface IVInputProps {
  volontaire: VolontaireAssigne;
  updateStatus: UpdateStatusMap;
  onUpdate: (volontaire: VolontaireAssigne, value: string) => Promise<void>;
}

export const IVInput: React.FC<IVInputProps> = ({ volontaire, updateStatus, onUpdate }) => {
  const [value, setValue] = useState(volontaire.iv?.toString() || "0");
  const isSavingRef = useRef(false);
  const lastSavedValueRef = useRef(volontaire.iv?.toString() || "0");
  const hasFocusRef = useRef(false);
  const pendingValueRef = useRef<string | null>(null);

  useEffect(() => {
    const propValue = volontaire.iv?.toString() || "0";
    if (!hasFocusRef.current && !isSavingRef.current && pendingValueRef.current === null && propValue !== lastSavedValueRef.current) {
      setValue(propValue);
      lastSavedValueRef.current = propValue;
    }
  }, [volontaire.iv]);

  const handleUpdate = async (newValue: string) => {
    if (isSavingRef.current) {
      pendingValueRef.current = newValue;
      return;
    }
    const ivValue = parseInt(newValue) || 0;
    const currentSavedValue = parseInt(lastSavedValueRef.current) || 0;
    if (ivValue === currentSavedValue) {
      pendingValueRef.current = null;
      return;
    }
    isSavingRef.current = true;
    pendingValueRef.current = newValue;
    try {
      await onUpdate(volontaire, newValue);
      lastSavedValueRef.current = newValue;
    } finally {
      isSavingRef.current = false;
      pendingValueRef.current = null;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        type="number"
        value={value}
        onChange={(e) => {
          const rawValue = e.target.value;
          const normalizedValue = rawValue === '' ? '' : String(parseInt(rawValue) || 0);
          setValue(normalizedValue);
        }}
        className="w-24"
        min="0"
        onFocus={(e) => { hasFocusRef.current = true; e.target.select(); }}
        onKeyDown={(e) => { if (e.key === "Enter") handleUpdate(value); }}
        onBlur={() => {
          const valueToSave = value;
          pendingValueRef.current = valueToSave;
          hasFocusRef.current = false;
          handleUpdate(valueToSave);
        }}
      />
      <UpdateStatusIcon status={updateStatus[`${volontaire.idVolontaire}_iv`]} />
    </div>
  );
};
