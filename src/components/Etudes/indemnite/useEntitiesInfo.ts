import { useState, useCallback } from "react";
import groupeService from "../../../services/groupeService";
import volontaireService from "../../../services/volontaireService";
import type { GroupeInfo, VolontaireInfo } from "./types";

export const useEntitiesInfo = () => {
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

  return { groupesInfo, volontairesInfo, loadGroupesInfo, loadVolontairesInfo };
};
