import { useCallback, useEffect, useMemo, useState } from 'react';
import rdvService from '../../../services/rdvService';
import etudeService from '../../../services/etudeService';
import groupeService from '../../../services/groupeService';
import etudeVolontaireService from '../../../services/etudeVolontaireService';
import { timeToMinutes } from '../../../utils/timeUtils';
import { useRendezVousContext } from '../context/RendezVousContext';

// Type definitions
interface Volunteer {
  id?: number;
  volontaireId?: number;
  nom?: string;
  prenom?: string;
  email?: string;
  [key: string]: any;
}

interface Study {
  id?: number;
  idEtude?: number;
  ref?: string;
  titre?: string;
  dateDebut?: string;
  dateFin?: string;
  groups?: Group[];
  [key: string]: any;
}

interface Group {
  id?: number;
  idGroupe?: number;
  nom?: string;
  idEtude?: number;
  iv?: number | string;
  [key: string]: any;
}

interface Appointment {
  idRdv?: number;
  id?: number;
  idEtude?: number;
  idVolontaire?: number | null;
  idGroupe?: number | null;
  date?: string;
  heure?: string;
  etat?: string;
  commentaires?: string;
  volontaire?: Volunteer | null;
  groupe?: {
    id?: number;
    idGroupe?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ScheduleConflict {
  date?: string;
  heure?: string;
  rdvId?: number;
}

interface Assignment {
  appointment: Appointment;
  volunteer: Volunteer;
}

interface Conflict {
  appointment: Appointment;
  volunteer: Volunteer;
}

interface Stats {
  totalAppointments: number;
  unassignedAppointments: number;
  assignedAppointments: number;
  totalVolunteers: number;
  totalGroups: number;
}

interface UseMassAssignmentReturn {
  studies: Study[];
  volunteers: Volunteer[];
  selectedEtudeId: number | null;
  setSelectedEtudeId: (id: number | null) => void;
  etudeDetails: Study;
  groupes: Group[];
  selectedGroupeId: number | null;
  setSelectedGroupeId: (id: number | null) => void;
  selectedGroupeDetails: Group | null;
  filteredAppointments: Appointment[];
  filteredVolunteers: Volunteer[];
  selectedAppointments: Appointment[];
  selectedVolunteers: Volunteer[];
  stats: Stats;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterOption: string;
  setFilterOption: (option: string) => void;
  volunteerFilterOption: string;
  setVolunteerFilterOption: (option: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  assignmentMode: string;
  setAssignmentMode: (mode: string) => void;
  actionMode: string;
  setActionMode: (mode: string) => void;
  getVolunteerAppointmentCount: (volunteerId: number | string) => number;
  loading: boolean;
  combinedLoading: boolean;
  error: string | null;
  handleSelectAppointment: (appointment: Appointment) => void;
  handleSelectAllAppointments: () => void;
  handleSelectVolunteer: (volunteer: Volunteer) => void;
  handleSelectAllVolunteers: () => void;
  setSelectedAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  setSelectedVolunteers: React.Dispatch<React.SetStateAction<Volunteer[]>>;
  handleMassAssignment: () => Promise<void>;
  handleUnassignSingle: (appointment: Appointment) => Promise<void>;
  showSwitcher: boolean;
  switcherRdv: Appointment | null;
  handleOpenSwitcher: (rdv: Appointment) => void;
  handleCloseSwitcher: () => void;
  handleSwitchComplete: () => Promise<void>;
}

const normalizeId = (value: any): number | null => {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const formatDate = (value: string | undefined): string => {
  if (!value) return 'Date inconnue';
  try {
    return new Date(value).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return value;
  }
};

const formatTime = (value: string | undefined): string => value ?? 'Heure inconnue';

const buildVolunteerConflicts = (appointments: Appointment[]): Map<number, ScheduleConflict[]> => {
  const map = new Map<number, ScheduleConflict[]>();
  appointments.forEach((appointment) => {
    const volunteerId = normalizeId(appointment.volontaire?.id ?? appointment.idVolontaire);
    if (!volunteerId) {
      return;
    }

    if (!map.has(volunteerId)) {
      map.set(volunteerId, []);
    }

    map.get(volunteerId)!.push({
      date: appointment.date,
      heure: appointment.heure,
      rdvId: appointment.idRdv ?? appointment.id,
    });
  });
  return map;
};

const useMassAssignment = (etudeIdFromUrl: string | number | null | undefined): UseMassAssignmentReturn => {
  const context = useRendezVousContext() as any;
  const contextVolunteers: Volunteer[] = context?.volunteers ?? [];
  const contextStudies: Study[] = context?.studies ?? [];
  const contextIsLoading: boolean = context?.isLoading ?? false;
  const contextError: Error | null = context?.error ?? null;
  const refreshContext = context?.refresh ?? (async () => {});

  const [selectedEtudeId, setSelectedEtudeId] = useState<number | null>(() => normalizeId(etudeIdFromUrl));
  const [etudeDetails, setEtudeDetails] = useState<Study>({});
  const [groupes, setGroupes] = useState<Group[]>([]);
  const [selectedGroupeId, setSelectedGroupeId] = useState<number | null>(null);
  const [selectedGroupeDetails, setSelectedGroupeDetails] = useState<Group | null>(null);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointments, setSelectedAppointments] = useState<Appointment[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Volunteer[]>([]);
  const [volunteerScheduleConflicts, setVolunteerScheduleConflicts] = useState<Map<number, ScheduleConflict[]>>(new Map());

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [volunteerFilterOption, setVolunteerFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('date');
  const [assignmentMode, setAssignmentMode] = useState('auto');
  const [actionMode, setActionMode] = useState('assign');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for appointment switcher
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [switcherRdv, setSwitcherRdv] = useState<Appointment | null>(null);

  const combinedLoading = loading || contextIsLoading;
  const displayError = error || (contextError ? contextError.message || 'Erreur lors du chargement des données.' : null);

  useEffect(() => {
    setSelectedEtudeId(normalizeId(etudeIdFromUrl));
  }, [etudeIdFromUrl]);

  // Forcer le mode d'action par défaut sur "assign" (bouton global retiré)
  useEffect(() => {
    if (actionMode !== 'assign') {
      setActionMode('assign');
    }
  }, [selectedEtudeId]);

  const loadEtudeData = useCallback(
    async (etudeId: number) => {
      const normalizedId = normalizeId(etudeId);
      if (!normalizedId) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [etude, rdvs, groupesData] = await Promise.all([
          etudeService.getById(normalizedId),
          rdvService.getByEtudeId(normalizedId),
          groupeService.getGroupesByIdEtude(normalizedId),
        ]);

        const safeAppointments = Array.isArray(rdvs) ? rdvs : [];
        const safeGroupes = Array.isArray(groupesData) ? groupesData : [];

        setEtudeDetails(etude ?? {});
        setAppointments(safeAppointments);
        setGroupes(safeGroupes);
        setVolunteerScheduleConflicts(buildVolunteerConflicts(safeAppointments));

        if (safeGroupes.length > 0) {
          const firstGroupId = normalizeId(safeGroupes[0].id ?? safeGroupes[0].idGroupe);
          setSelectedGroupeId((previous) => previous ?? firstGroupId);
        } else {
          setSelectedGroupeId(null);
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données étude', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadGroupeDetails = useCallback(async (groupeId: number | null) => {
    const normalizedId = normalizeId(groupeId);
    if (!normalizedId) {
      setSelectedGroupeDetails(null);
      return;
    }

    try {
      const response = await groupeService.getById(normalizedId);
      setSelectedGroupeDetails(response ?? null);
    } catch (err) {
      console.error('Erreur chargement détails groupe', err);
      setSelectedGroupeDetails(null);
    }
  }, []);

  useEffect(() => {
    if (selectedEtudeId) {
      void loadEtudeData(selectedEtudeId);
    } else {
      setEtudeDetails({});
      setAppointments([]);
      setGroupes([]);
      setSelectedAppointments([]);
      setSelectedVolunteers([]);
      setSelectedGroupeId(null);
      setSelectedGroupeDetails(null);
      setVolunteerScheduleConflicts(new Map());
    }
  }, [loadEtudeData, selectedEtudeId]);

  useEffect(() => {
    void loadGroupeDetails(selectedGroupeId);
  }, [loadGroupeDetails, selectedGroupeId]);

  useEffect(() => {
    setSelectedAppointments([]);
    setSelectedVolunteers([]);
  }, [actionMode, filterOption]);

  const getAppointmentId = useCallback((appointment: Appointment): number | null => appointment?.idRdv ?? appointment?.id ?? null, []);

  const getVolunteerId = useCallback((volunteer: Volunteer): number | null => normalizeId(volunteer?.id ?? volunteer?.volontaireId), []);

  const getVolunteerAppointmentCount = useCallback(
    (volunteerId: number | string): number => {
      const normalizedVolunteerId = normalizeId(volunteerId);
      if (!normalizedVolunteerId) {
        return 0;
      }
      return (volunteerScheduleConflicts.get(normalizedVolunteerId) || []).length;
    },
    [volunteerScheduleConflicts],
  );

  const hasScheduleConflict = useCallback(
    (volunteerId: number | null, date: string | undefined, time: string | undefined): boolean => {
      const normalizedVolunteerId = normalizeId(volunteerId);
      if (!normalizedVolunteerId) {
        return false;
      }
      const conflicts = volunteerScheduleConflicts.get(normalizedVolunteerId) || [];
      return conflicts.some((conflict) => conflict.date === date && conflict.heure === time);
    },
    [volunteerScheduleConflicts],
  );

  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const hasVolunteer = Boolean(appointment.volontaire || appointment.idVolontaire);
        switch (filterOption) {
          case 'unassigned':
            return !hasVolunteer;
          case 'assigned':
            return hasVolunteer;
          default:
            return true;
        }
      })
      .slice()
      .sort((a, b) => {
        switch (sortOption) {
          case 'date':
            return new Date(a.date ?? '').getTime() - new Date(b.date ?? '').getTime();
          case 'time':
            return timeToMinutes(a.heure) - timeToMinutes(b.heure);
          case 'status':
            return (a.etat ?? '').localeCompare(b.etat ?? '');
          default:
            return 0;
        }
      });
  }, [appointments, filterOption, sortOption]);

  const filteredVolunteers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return contextVolunteers.filter((volunteer) => {
      const matchesSearch =
        term.length === 0 ||
        (volunteer.nom ?? '').toLowerCase().includes(term) ||
        (volunteer.prenom ?? '').toLowerCase().includes(term) ||
        (volunteer.email ?? '').toLowerCase().includes(term);

      if (!matchesSearch) {
        return false;
      }

      const count = getVolunteerAppointmentCount(getVolunteerId(volunteer) ?? 0);
      switch (volunteerFilterOption) {
        case 'hasAppointments':
          return count > 0;
        case 'noAppointments':
          return count === 0;
        default:
          return true;
      }
    });
  }, [contextVolunteers, getVolunteerAppointmentCount, getVolunteerId, searchQuery, volunteerFilterOption]);

  const handleSelectAppointment = useCallback(
    (appointment: Appointment) => {
      const id = getAppointmentId(appointment);
      if (!id) {
        return;
      }

      const exists = selectedAppointments.some((item) => getAppointmentId(item) === id);
      const hasVolunteer = Boolean(appointment.volontaire || appointment.idVolontaire);
      const canSelect = (actionMode === 'assign' && !hasVolunteer) || (actionMode === 'unassign' && hasVolunteer);

      if (!canSelect) {
        return;
      }

      if (exists) {
        setSelectedAppointments((previous) => previous.filter((item) => getAppointmentId(item) !== id));
      } else {
        setSelectedAppointments((previous) => [...previous, appointment]);
      }
    },
    [actionMode, getAppointmentId, selectedAppointments],
  );

  const handleSelectVolunteer = useCallback(
    (volunteer: Volunteer) => {
      const id = getVolunteerId(volunteer);
      if (!id) {
        return;
      }

      const exists = selectedVolunteers.some((item) => getVolunteerId(item) === id);
      if (exists) {
        setSelectedVolunteers((previous) => previous.filter((item) => getVolunteerId(item) !== id));
      } else {
        setSelectedVolunteers((previous) => [...previous, volunteer]);
      }
    },
    [getVolunteerId, selectedVolunteers],
  );

  const handleSelectAllAppointments = useCallback(() => {
    const eligible = filteredAppointments.filter((appointment) => {
      const hasVolunteer = Boolean(appointment.volontaire || appointment.idVolontaire);
      return (actionMode === 'assign' && !hasVolunteer) || (actionMode === 'unassign' && hasVolunteer);
    });

    const allSelected = eligible.every((appointment) =>
      selectedAppointments.some((item) => getAppointmentId(item) === getAppointmentId(appointment)),
    );

    if (allSelected) {
      setSelectedAppointments((previous) =>
        previous.filter(
          (item) => !eligible.some((appointment) => getAppointmentId(appointment) === getAppointmentId(item)),
        ),
      );
    } else {
      setSelectedAppointments((previous) => [
        ...previous.filter((item) => !eligible.some((appointment) => getAppointmentId(appointment) === getAppointmentId(item))),
        ...eligible,
      ]);
    }
  }, [actionMode, filteredAppointments, getAppointmentId, selectedAppointments]);

  const handleSelectAllVolunteers = useCallback(() => {
    const allSelected = filteredVolunteers.every((volunteer) =>
      selectedVolunteers.some((item) => getVolunteerId(item) === getVolunteerId(volunteer)),
    );

    if (allSelected) {
      setSelectedVolunteers((previous) =>
        previous.filter((item) => !filteredVolunteers.some((volunteer) => getVolunteerId(volunteer) === getVolunteerId(item))),
      );
    } else {
      setSelectedVolunteers((previous) => [
        ...previous.filter((item) => !filteredVolunteers.some((volunteer) => getVolunteerId(volunteer) === getVolunteerId(item))),
        ...filteredVolunteers,
      ]);
    }
  }, [filteredVolunteers, getVolunteerId, selectedVolunteers]);

  const removeStudyVolunteerAssociation = useCallback(
    async (etudeId: number, volunteerId: number) => {
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

        const existingAssociation = associations.find(
          (item: any) => normalizeId(item.idVolontaire) === normalizedVolunteerId,
        );

        if (!existingAssociation) {
          return;
        }

        const strategies: Array<() => Promise<void>> = [];

        strategies.push(async () => {
          const associationId = etudeVolontaireService.createAssociationId(
            existingAssociation.idEtude,
            existingAssociation.idGroupe,
            existingAssociation.idVolontaire,
            existingAssociation.iv,
            existingAssociation.numsujet,
            existingAssociation.paye,
            existingAssociation.statut,
          );
          await etudeVolontaireService.updateVolontaire(associationId, null);
        });

        if (existingAssociation.numsujet && existingAssociation.numsujet > 0) {
          strategies.push(async () => {
            const associationId = etudeVolontaireService.createAssociationId(
              existingAssociation.idEtude,
              existingAssociation.idGroupe,
              existingAssociation.idVolontaire,
              existingAssociation.iv,
              existingAssociation.numsujet,
              existingAssociation.paye,
              existingAssociation.statut,
            );

            await etudeVolontaireService.updateNumSujet(associationId, 0);
            await etudeVolontaireService.delete(
              etudeVolontaireService.createAssociationId(
                existingAssociation.idEtude,
                existingAssociation.idGroupe,
                existingAssociation.idVolontaire,
                existingAssociation.iv,
                0,
                existingAssociation.paye,
                existingAssociation.statut,
              ),
            );
          });
        }

        strategies.push(async () => {
          const associationId = etudeVolontaireService.createAssociationId(
            existingAssociation.idEtude,
            existingAssociation.idGroupe,
            existingAssociation.idVolontaire,
            existingAssociation.iv,
            existingAssociation.numsujet,
            existingAssociation.paye,
            existingAssociation.statut,
          );
          await etudeVolontaireService.updateStatut(associationId, 'ANNULE');
          await etudeVolontaireService.delete(
            etudeVolontaireService.createAssociationId(
              existingAssociation.idEtude,
              existingAssociation.idGroupe,
              existingAssociation.idVolontaire,
              existingAssociation.iv,
              existingAssociation.numsujet,
              existingAssociation.paye,
              'ANNULE',
            ),
          );
        });

        strategies.push(async () => {
          await etudeVolontaireService.desassignerVolontaireDEtude(etudeId, normalizedVolunteerId);
        });

        for (const strategy of strategies) {
          try {
            await strategy();
            break;
          } catch (err) {
            console.warn('Stratégie suppression association échouée', err);
          }
        }
      } catch (err) {
        console.error('Erreur lors de la suppression association Etude/Volontaire', err);
      }
    },
    [],
  );

  const ensureVolunteerAssociation = useCallback(
    async (etudeId: number, groupId: number | null, volunteerId: number) => {
      const normalizedVolunteerId = normalizeId(volunteerId);
      if (!etudeId || !normalizedVolunteerId) {
        return;
      }

      const normalizedGroupId = normalizeId(groupId);

      try {
        await removeStudyVolunteerAssociation(etudeId, normalizedVolunteerId);
      } catch (err) {
        console.warn("Impossible de supprimer l'association existante Etude/Volontaire", err);
      }

      const groupDetails =
        groupes.find((group) => normalizeId(group.id ?? group.idGroupe) === normalizedGroupId) ||
        selectedGroupeDetails ||
        null;

      const ivValue = groupDetails?.iv ? parseInt(String(groupDetails.iv), 10) || 0 : 0;

      const payload = {
        idEtude: etudeId,
        idVolontaire: normalizedVolunteerId,
        idGroupe: normalizedGroupId ?? 0,
        iv: ivValue,
        numsujet: 0,
        paye: ivValue > 0 ? 1 : 0,
        statut: 'INSCRIT',
      };

      try {
        await etudeVolontaireService.create(payload);
      } catch (err) {
        console.warn('Creation association Etude/Volontaire impossible', err);
      }
    },
    [groupes, removeStudyVolunteerAssociation, selectedGroupeDetails],
  );

  const handleMassAssignment = useCallback(async () => {
    if (!selectedEtudeId || selectedAppointments.length === 0) {
      window.alert('Veuillez sélectionner au moins un rendez-vous.');
      return;
    }

    if (actionMode === 'assign') {
      if (selectedVolunteers.length === 0) {
        window.alert("Veuillez sélectionner au moins un volontaire pour l'assignation.");
        return;
      }

      if (!selectedGroupeId) {
        window.alert("Veuillez sélectionner un groupe pour l'assignation.");
        return;
      }
    }

    try {
      setLoading(true);

      if (actionMode === 'unassign') {
        const unassignments = selectedAppointments.map((appointment) => ({
          appointment,
          volunteerId: normalizeId(appointment.volontaire?.id ?? appointment.idVolontaire),
        }));

        if (!window.confirm(`Voulez-vous vraiment désassigner ${unassignments.length} volontaire(s) ?`)) {
          setLoading(false);
          return;
        }

        await Promise.all(
          unassignments.map(async ({ appointment, volunteerId }) => {
            if (volunteerId) {
              await removeStudyVolunteerAssociation(selectedEtudeId, volunteerId);
            }

            const payload = {
              idEtude: selectedEtudeId,
              idRdv: getAppointmentId(appointment),
              idVolontaire: null,
              idGroupe:
                appointment.idGroupe ??
                appointment.groupe?.id ??
                appointment.groupe?.idGroupe ??
                null,
              date: appointment.date,
              heure: appointment.heure,
              etat: appointment.etat ?? 'PLANIFIE',
              commentaires: appointment.commentaires,
            };

            await rdvService.update(selectedEtudeId, getAppointmentId(appointment) as number, payload);
          }),
        );

        window.alert(`${unassignments.length} désassignation(s) effectuée(s) avec succès.`);
      } else {
        if (assignmentMode !== 'auto') {
          window.alert('Mode manuel non encore implémenté.');
          setLoading(false);
          return;
        }

        const assignments: Assignment[] = [];
        const conflicts: Conflict[] = [];
        const maxPairs = Math.min(selectedAppointments.length, selectedVolunteers.length);

        for (let index = 0; index < maxPairs; index += 1) {
          const appointment = selectedAppointments[index];
          const volunteer = selectedVolunteers[index];
          const volunteerId = getVolunteerId(volunteer);

          if (hasScheduleConflict(volunteerId, appointment.date, appointment.heure)) {
            conflicts.push({ appointment, volunteer });
            continue;
          }

          assignments.push({ appointment, volunteer });
        }

        if (conflicts.length > 0) {
          const message = conflicts
            .map(({ volunteer, appointment }) =>
              `• ${volunteer.prenom} ${volunteer.nom} - ${formatDate(appointment.date)} à ${formatTime(appointment.heure)}`,
            )
            .join('\n');

          const proceed = window.confirm(
            `Attention : ${conflicts.length} conflit(s) détecté(s) :\n\n${message}\n\nContinuer avec ${assignments.length} assignation(s) sans conflit ?`,
          );

          if (!proceed) {
            setLoading(false);
            return;
          }
        }

        if (selectedAppointments.length !== selectedVolunteers.length && assignments.length > 0) {
          const diff = Math.abs(selectedAppointments.length - selectedVolunteers.length);
          const more = selectedAppointments.length > selectedVolunteers.length ? 'rendez-vous' : 'volontaires';
          const proceed = window.confirm(
            `Il y a ${diff} ${more} en plus. Continuer avec ${assignments.length} assignation(s) ?`,
          );
          if (!proceed) {
            setLoading(false);
            return;
          }
        }

        if (assignments.length === 0) {
          window.alert("Aucune assignation possible sans conflit d'horaire.");
          setLoading(false);
          return;
        }

        await Promise.all(
          assignments.map(async ({ appointment, volunteer }) => {
            const volunteerId = getVolunteerId(volunteer) as number;
            await ensureVolunteerAssociation(selectedEtudeId, selectedGroupeId, volunteerId);

            const payload = {
              idEtude: selectedEtudeId,
              idRdv: getAppointmentId(appointment),
              idVolontaire: volunteerId,
              idGroupe: selectedGroupeId,
              date: appointment.date,
              heure: appointment.heure,
              etat: appointment.etat ?? 'PLANIFIE',
              commentaires: appointment.commentaires,
            };

            await rdvService.update(selectedEtudeId, getAppointmentId(appointment) as number, payload);
          }),
        );

        let successMessage = `${assignments.length} assignation(s) effectuée(s) avec succès.`;
        if (selectedGroupeDetails?.iv) {
          successMessage += `\n\nIV du groupe appliqué : ${selectedGroupeDetails.iv}€ par volontaire.`;
        }
        if (conflicts.length > 0) {
          successMessage += `\n\n${conflicts.length} assignation(s) ignorée(s) à cause de conflits.`;
        }
        window.alert(successMessage);
      }

      await loadEtudeData(selectedEtudeId);
      await refreshContext();
      setSelectedAppointments([]);
      setSelectedVolunteers([]);
    } catch (err) {
      console.error(
        `Erreur lors de l'${actionMode === 'assign' ? 'assignation' : 'désassignation'} en masse`,
        err,
      );
      window.alert(
        `Une erreur est survenue lors de l'${actionMode === 'assign' ? 'assignation' : 'désassignation'}.`,
      );
    } finally {
      setLoading(false);
    }
  }, [
    actionMode,
    assignmentMode,
    ensureVolunteerAssociation,
    getAppointmentId,
    getVolunteerId,
    hasScheduleConflict,
    loadEtudeData,
    refreshContext,
    removeStudyVolunteerAssociation,
    selectedAppointments,
    selectedEtudeId,
    selectedGroupeDetails,
    selectedGroupeId,
    selectedVolunteers,
  ]);

  const handleUnassignSingle = useCallback(
    async (appointment: Appointment) => {
      if (!selectedEtudeId) {
        return;
      }

      const confirmed = window.confirm('Voulez-vous vraiment désassigner ce volontaire ?');
      if (!confirmed) {
        return;
      }

      try {
        setLoading(true);
        const volunteerId = normalizeId(appointment.volontaire?.id ?? appointment.idVolontaire);
        if (volunteerId) {
          await removeStudyVolunteerAssociation(selectedEtudeId, volunteerId);
        }

        const payload = {
          idEtude: selectedEtudeId,
          idRdv: getAppointmentId(appointment),
          idVolontaire: null,
          idGroupe:
            appointment.idGroupe ??
            appointment.groupe?.id ??
            appointment.groupe?.idGroupe ??
            null,
          date: appointment.date,
          heure: appointment.heure,
          etat: appointment.etat ?? 'PLANIFIE',
          commentaires: appointment.commentaires,
        };

        await rdvService.update(selectedEtudeId, getAppointmentId(appointment) as number, payload);
        await loadEtudeData(selectedEtudeId);
        await refreshContext();
        window.alert('Volontaire désassigné avec succès.');
      } catch (err) {
        console.error('Erreur lors de la désassignation', err);
        window.alert('Une erreur est survenue lors de la désassignation.');
      } finally {
        setLoading(false);
      }
    },
    [getAppointmentId, loadEtudeData, refreshContext, removeStudyVolunteerAssociation, selectedEtudeId],
  );

  // Handlers for appointment switcher
  const handleOpenSwitcher = useCallback((rdv: Appointment) => {
    setSwitcherRdv(rdv);
    setShowSwitcher(true);
  }, []);

  const handleCloseSwitcher = useCallback(() => {
    setShowSwitcher(false);
    setSwitcherRdv(null);
  }, []);

  const handleSwitchComplete = useCallback(async () => {
    // Reload data after successful switch
    if (selectedEtudeId) {
      await loadEtudeData(selectedEtudeId);
    }
    await refreshContext();
  }, [selectedEtudeId, loadEtudeData, refreshContext]);

  const stats: Stats = useMemo(
    () => ({
      totalAppointments: appointments.length,
      unassignedAppointments: appointments.filter((appointment) => !appointment.volontaire && !appointment.idVolontaire).length,
      assignedAppointments: appointments.filter((appointment) => appointment.volontaire || appointment.idVolontaire).length,
      totalVolunteers: contextVolunteers.length,
      totalGroups: groupes.length,
    }),
    [appointments, contextVolunteers.length, groupes.length],
  );

  return {
    studies: contextStudies,
    volunteers: contextVolunteers,
    selectedEtudeId,
    setSelectedEtudeId,
    etudeDetails,
    groupes,
    selectedGroupeId,
    setSelectedGroupeId,
    selectedGroupeDetails,
    filteredAppointments,
    filteredVolunteers,
    selectedAppointments,
    selectedVolunteers,
    stats,
    searchQuery,
    setSearchQuery,
    filterOption,
    setFilterOption,
    volunteerFilterOption,
    setVolunteerFilterOption,
    sortOption,
    setSortOption,
    assignmentMode,
    setAssignmentMode,
    actionMode,
    setActionMode,
    getVolunteerAppointmentCount,
    loading,
    combinedLoading,
    error: displayError,
    handleSelectAppointment,
    handleSelectAllAppointments,
    handleSelectVolunteer,
    handleSelectAllVolunteers,
    setSelectedAppointments,
    setSelectedVolunteers,
    handleMassAssignment,
    handleUnassignSingle,
    showSwitcher,
    switcherRdv,
    handleOpenSwitcher,
    handleCloseSwitcher,
    handleSwitchComplete,
  };
};

export default useMassAssignment;
