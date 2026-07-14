type AppointmentLike = {
  id?: number | string | null;
  idRdv?: number | string | null;
  idVolontaire?: number | string | null;
  volontaireId?: number | string | null;
  volontaire?: {
    id?: number | string | null;
    idVol?: number | string | null;
    volontaireId?: number | string | null;
  } | null;
};

type PlannedAssignment = {
  appointment: AppointmentLike;
  volunteerId: number | string | null | undefined;
  volunteerName?: string;
};

type PassageWarning = {
  volunteerId: number;
  volunteerName?: string;
  projectedCount: number;
};

const normalizeId = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getAppointmentIdentity = (appointment: AppointmentLike): string | null => {
  const id = appointment?.idRdv ?? appointment?.id;
  if (id === null || id === undefined || id === '') return null;
  return String(id);
};

export const getAssignedVolunteerId = (appointment: AppointmentLike): number | null =>
  normalizeId(
    appointment?.idVolontaire ??
      appointment?.volontaireId ??
      appointment?.volontaire?.id ??
      appointment?.volontaire?.idVol ??
      appointment?.volontaire?.volontaireId,
  );

export const buildPassageAverageWarning = (
  appointments: AppointmentLike[],
  plannedAssignments: PlannedAssignment[],
): string | null => {
  const buildWarningMessage = (
    warnings: PassageWarning[],
    averageLabel?: string,
  ) => {
    const details = warnings
      .map((warning) => {
        const name = warning.volunteerName || `Volontaire #${warning.volunteerId}`;
        return `- ${name} aura ${warning.projectedCount} passage(s) sur cette etude.`;
      })
      .join('\n');

    return [
      'Attention : possible doublon de passage sur cette etude.',
      '',
      averageLabel ? `Moyenne actuelle : ${averageLabel} passage(s) par volontaire.` : null,
      details,
      '',
      'Voulez-vous continuer ?',
    ].filter((line): line is string => line !== null).join('\n');
  };

  const currentByVolunteer = new Map<number, Set<string>>();
  let currentAssignedCount = 0;

  appointments.forEach((appointment) => {
    const appointmentId = getAppointmentIdentity(appointment);
    const volunteerId = getAssignedVolunteerId(appointment);
    if (!appointmentId || volunteerId === null) return;

    if (!currentByVolunteer.has(volunteerId)) {
      currentByVolunteer.set(volunteerId, new Set());
    }

    const set = currentByVolunteer.get(volunteerId)!;
    if (!set.has(appointmentId)) {
      currentAssignedCount += 1;
    }
    set.add(appointmentId);
  });

  if (currentAssignedCount === 0 || currentByVolunteer.size === 0) {
    return null;
  }

  const average = currentAssignedCount / currentByVolunteer.size;
  const selectedAppointmentIds = new Set(
    plannedAssignments
      .map(({ appointment }) => getAppointmentIdentity(appointment))
      .filter((id): id is string => Boolean(id)),
  );

  const projectedByVolunteer = new Map<number, Set<string>>();
  currentByVolunteer.forEach((ids, volunteerId) => {
    projectedByVolunteer.set(
      volunteerId,
      new Set(Array.from(ids).filter((appointmentId) => !selectedAppointmentIds.has(appointmentId))),
    );
  });

  plannedAssignments.forEach(({ appointment, volunteerId }) => {
    const normalizedVolunteerId = normalizeId(volunteerId);
    const appointmentId = getAppointmentIdentity(appointment);
    if (normalizedVolunteerId === null || !appointmentId) return;

    if (!projectedByVolunteer.has(normalizedVolunteerId)) {
      projectedByVolunteer.set(normalizedVolunteerId, new Set());
    }
    projectedByVolunteer.get(normalizedVolunteerId)!.add(appointmentId);
  });

  const warnings = plannedAssignments
    .map(({ volunteerId, volunteerName }): PassageWarning | null => {
      const normalizedVolunteerId = normalizeId(volunteerId);
      if (normalizedVolunteerId === null) return null;

      const currentCount = currentByVolunteer.get(normalizedVolunteerId)?.size ?? 0;
      const projectedCount = projectedByVolunteer.get(normalizedVolunteerId)?.size ?? 0;
      if (projectedCount <= currentCount || projectedCount <= average) return null;

      return {
        volunteerId: normalizedVolunteerId,
        volunteerName,
        projectedCount,
      };
    })
    .filter((warning): warning is PassageWarning => warning !== null);

  const uniqueWarnings = Array.from(
    new Map(warnings.map((warning) => [warning.volunteerId, warning])).values(),
  );

  if (uniqueWarnings.length === 0) {
    return null;
  }

  const averageLabel = average.toLocaleString('fr-FR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: average % 1 === 0 ? 0 : 1,
  });

  return buildWarningMessage(uniqueWarnings, averageLabel);
};
