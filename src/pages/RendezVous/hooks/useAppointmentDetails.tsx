import { useCallback, useEffect, useMemo, useState } from 'react';
import rdvService from '../../../services/rdvService';
import groupeService from '../../../services/groupeService';
import volontaireService from '../../../services/volontaireService';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import { useRendezVousContext } from '../context/RendezVousContext';

// Type definitions
interface Appointment {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  etudeId?: number;
  idVolontaire?: number | null;
  volontaireId?: number;
  idGroupe?: number;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  etude?: {
    id?: number;
    [key: string]: any;
  };
  volontaire?: Volunteer | null;
  groupe?: {
    id?: number;
    idGroupe?: number;
    iv?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Group {
  id?: number;
  idGroupe?: number;
  nom?: string;
  idEtude?: number;
  iv?: number;
  [key: string]: any;
}

interface Volunteer {
  id?: number;
  volontaireId?: number;
  nomVol?: string;
  prenomVol?: string;
  emailVol?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  [key: string]: any;
}

interface Identifiers {
  idEtude: number | null;
  idRdv: number | null;
}

interface AssignVolunteerParams {
  volunteerId: number | string;
  groupId?: number | string | null;
}

interface UseAppointmentDetailsReturn {
  appointment: Appointment | null;
  group: Group | null;
  volunteer: Volunteer | null;
  volunteerOptions: Volunteer[];
  loading: boolean;
  assigning: boolean;
  deleting: boolean;
  error: Error | null;
  assignVolunteer: (params: AssignVolunteerParams) => Promise<void>;
  unassignVolunteer: () => Promise<void>;
  deleteAppointment: () => Promise<void>;
}

const normalizeId = (value: any): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const buildVolunteerMap = (volunteers: Volunteer[] = []): Map<number, Volunteer> => {
  const map = new Map<number, Volunteer>();
  volunteers.forEach((volunteer) => {
    const id = normalizeId(volunteer.id ?? volunteer.volontaireId);
    if (id) {
      map.set(id, volunteer);
    }
  });
  return map;
};

const deriveIdentifiers = (appointment: Appointment | null): Identifiers => {
  if (!appointment) {
    return { idEtude: null, idRdv: null };
  }

  return {
    idEtude: appointment.idEtude ?? appointment.etude?.id ?? appointment.etudeId ?? null,
    idRdv: appointment.idRdv ?? appointment.id ?? null,
  };
};

const useAppointmentDetails = (initialAppointment: Appointment | null): UseAppointmentDetailsReturn => {
  const context = useRendezVousContext() as any;
  const refreshContext = context?.refresh ?? (async () => {});

  const [appointment, setAppointment] = useState<Appointment | null>(initialAppointment ?? null);
  const [group, setGroup] = useState<Group | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [volunteerOptions, setVolunteerOptions] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const volunteerMap = useMemo(() => buildVolunteerMap(volunteerOptions), [volunteerOptions]);
  const identifiers = useMemo(() => deriveIdentifiers(initialAppointment), [initialAppointment]);

  // Charger la liste des volontaires disponibles
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        // Utiliser getAllWithoutPagination pour avoir tous les volontaires
        const volunteers = await volontaireService.getAllWithoutPagination();
        if (Array.isArray(volunteers)) {
          setVolunteerOptions(volunteers.filter((v): v is Volunteer => v !== null));
        }
      } catch (err) {
        console.warn('Impossible de charger la liste des volontaires', err);
        // Fallback: essayer getAll avec pagination
        try {
          const response = await volontaireService.getAll({ size: 1000 });
          const data = response?.data?.content ?? response?.data ?? response ?? [];
          if (Array.isArray(data)) {
            setVolunteerOptions(data.filter((v): v is Volunteer => v !== null));
          }
        } catch (fallbackErr) {
          console.warn('Fallback également échoué', fallbackErr);
        }
      }
    };

    fetchVolunteers();
  }, []);

  const fetchAppointment = useCallback(async () => {
    if (!identifiers.idEtude || !identifiers.idRdv) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await rdvService.getById(identifiers.idEtude, identifiers.idRdv);
      if (response) {
        setAppointment((previous) => ({ ...previous, ...response }));
      }
    } catch (err) {
      console.error('Erreur lors du chargement du rendez-vous', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [identifiers]);

  const fetchGroup = useCallback(async (idGroupe: number | string | null | undefined) => {
    const normalizedId = normalizeId(idGroupe);
    if (!normalizedId) {
      setGroup(null);
      return;
    }

    try {
      const response = await groupeService.getById(normalizedId);
      setGroup(response ?? null);
    } catch (err) {
      console.warn('Impossible de charger les détails du groupe', err);
      setGroup(null);
    }
  }, []);

  const fetchVolunteer = useCallback(async (idVolontaire: number | string | null | undefined) => {
    const normalizedId = normalizeId(idVolontaire);
    if (!normalizedId) {
      setVolunteer(null);
      return;
    }

    const candidate = volunteerMap.get(normalizedId);
    if (candidate) {
      setVolunteer(candidate);
      return;
    }

    try {
      const response = await volontaireService.getById(normalizedId);
      setVolunteer(response?.data ?? null);
    } catch (err) {
      console.warn('Impossible de charger les détails du volontaire', err);
      setVolunteer(null);
    }
  }, [volunteerMap]);

  useEffect(() => {
    setAppointment(initialAppointment ?? null);
  }, [initialAppointment]);

  useEffect(() => {
    if (!appointment) {
      return;
    }

    const groupIdentifier = appointment.idGroupe ?? appointment.groupe?.id ?? appointment.groupe?.idGroupe;
    const volunteerIdentifier = appointment.idVolontaire ?? appointment.volontaire?.id ?? appointment.volontaireId;

    void fetchGroup(groupIdentifier);
    void fetchVolunteer(volunteerIdentifier);
  }, [appointment, fetchGroup, fetchVolunteer]);

  useEffect(() => {
    if (!identifiers.idEtude || !identifiers.idRdv) {
      return;
    }
    void fetchAppointment();
  }, [fetchAppointment, identifiers]);

  const ensureVolunteerAssociation = useCallback(
    async (etudeId: number, groupId: number | null, volunteerId: number) => {
      const normalizedVolunteerId = normalizeId(volunteerId);
      const normalizedGroupId = normalizeId(groupId);
      if (!etudeId || !normalizedVolunteerId) {
        return;
      }

      let associations: any[] = [];
      try {
        const response = await etudeVolontaireService.getVolontairesByEtude(etudeId);
        if (Array.isArray(response)) {
          associations = response;
        } else if (Array.isArray(response?.data)) {
          associations = response.data;
        }
      } catch (err) {
        console.warn('Récupération associations Étude/Volontaire impossible', err);
      }

      const existingAssociation = associations.find(
        (item) => normalizeId(item.idVolontaire) === normalizedVolunteerId,
      );

      if (existingAssociation) {
        try {
          const associationId = etudeVolontaireService.createAssociationId(
            existingAssociation.idEtude,
            existingAssociation.idGroupe,
            existingAssociation.idVolontaire,
            existingAssociation.iv,
            existingAssociation.numsujet,
            existingAssociation.paye,
            existingAssociation.statut,
          );
          await etudeVolontaireService.delete(associationId);
        } catch (err) {
          console.warn('Suppression association Étude/Volontaire impossible', err);
        }
      }

      // Préserver l'IV individuel existant si le volontaire en avait un
      const existingIv = existingAssociation?.iv || 0;
      const existingNumsujet = existingAssociation?.numsujet || 0;
      const existingPaye = existingAssociation?.paye || 0;
      const existingStatut = existingAssociation?.statut || 'INSCRIT';
      const groupIv = group?.iv ?? 0;
      const ivValue = existingIv > 0 ? existingIv : groupIv;

      const payload = {
        idEtude: etudeId,
        idVolontaire: normalizedVolunteerId,
        idGroupe: normalizedGroupId ?? 0,
        iv: ivValue,
        numsujet: existingNumsujet,
        paye: existingPaye > 0 ? existingPaye : 0,
        statut: existingStatut,
      };

      try {
        await etudeVolontaireService.create(payload);
      } catch (err) {
        console.warn('Création association Étude/Volontaire impossible', err);
      }
    },
    [group],
  );

  const removeVolunteerAssociation = useCallback(async (etudeId: number, volunteerId: number | string | null | undefined) => {
    const normalizedVolunteerId = normalizeId(volunteerId);
    if (!etudeId || !normalizedVolunteerId) {
      return;
    }

    try {
      const response = await etudeVolontaireService.getVolontairesByEtude(etudeId);
      const associations = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const association = associations.find((item: any) => normalizeId(item.idVolontaire) === normalizedVolunteerId);
      if (!association) {
        return;
      }

      const associationId = etudeVolontaireService.createAssociationId(
        association.idEtude,
        association.idGroupe,
        association.idVolontaire,
        association.iv,
        association.numsujet,
        association.paye,
        association.statut,
      );

      await etudeVolontaireService.delete(associationId);
    } catch (err) {
      console.warn('Impossible de supprimer lassociation Étude/Volontaire', err);
    }
  }, []);

  const assignVolunteer = useCallback(
    async ({ volunteerId, groupId }: AssignVolunteerParams): Promise<void> => {
      if (!identifiers.idEtude || !identifiers.idRdv) {
        return;
      }

      const normalizedVolunteerId = normalizeId(volunteerId);
      if (!normalizedVolunteerId) {
        throw new Error('Volontaire invalide');
      }

      try {
        setAssigning(true);
        setError(null);

        // Supprimer l'association de l'ancien volontaire s'il y en a un
        const oldVolunteerId = appointment?.idVolontaire ?? appointment?.volontaire?.id;
        if (oldVolunteerId && normalizeId(oldVolunteerId) !== normalizedVolunteerId) {
          await removeVolunteerAssociation(identifiers.idEtude, oldVolunteerId);
        }

        const targetGroupId =
          normalizeId(groupId) ??
          normalizeId(appointment?.idGroupe) ??
          normalizeId(appointment?.groupe?.id) ??
          normalizeId(appointment?.groupe?.idGroupe) ??
          0;

        await ensureVolunteerAssociation(identifiers.idEtude, targetGroupId, normalizedVolunteerId);

        const payload: any = {
          ...appointment,
          idEtude: identifiers.idEtude,
          idRdv: identifiers.idRdv,
          idVolontaire: normalizedVolunteerId,
          idGroupe: targetGroupId,
        };

        await rdvService.update(identifiers.idEtude, identifiers.idRdv, payload);
        await fetchAppointment();
        await refreshContext();
      } catch (err) {
        console.error('Erreur lors de l\'assignation du volontaire', err);
        setError(err as Error);
        throw err;
      } finally {
        setAssigning(false);
      }
    },
    [appointment, ensureVolunteerAssociation, fetchAppointment, identifiers, refreshContext, removeVolunteerAssociation],
  );

  const unassignVolunteer = useCallback(async (): Promise<void> => {
    if (!identifiers.idEtude || !identifiers.idRdv) {
      return;
    }

    try {
      setAssigning(true);
      setError(null);

      await removeVolunteerAssociation(
        identifiers.idEtude,
        appointment?.idVolontaire ?? appointment?.volontaire?.id,
      );

      const payload: any = {
        ...appointment,
        idEtude: identifiers.idEtude,
        idRdv: identifiers.idRdv,
        idVolontaire: null,
      };

      await rdvService.update(identifiers.idEtude, identifiers.idRdv, payload);
      await fetchAppointment();
      await refreshContext();
    } catch (err) {
      console.error('Erreur lors de la désassignation du volontaire', err);
      setError(err as Error);
      throw err;
    } finally {
      setAssigning(false);
    }
  }, [appointment, fetchAppointment, identifiers, refreshContext, removeVolunteerAssociation]);

  const deleteAppointment = useCallback(async (): Promise<void> => {
    if (!identifiers.idEtude || !identifiers.idRdv) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      await rdvService.delete(identifiers.idEtude, identifiers.idRdv);
      await refreshContext();
    } catch (err) {
      console.error('Erreur lors de la suppression du rendez-vous', err);
      setError(err as Error);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [identifiers, refreshContext]);

  return {
    appointment,
    group,
    volunteer,
    volunteerOptions,
    loading,
    assigning,
    deleting,
    error,
    assignVolunteer,
    unassignVolunteer,
    deleteAppointment,
  };
};

export default useAppointmentDetails;
