type StudyDates = { dateDebut?: string; dateFin?: string };
type AppointmentDate = { date?: string };

const parseCalendarDate = (value?: string): Date | null => {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
};

export const resolveStudyPeriod = (
  study: StudyDates,
  appointments: AppointmentDate[],
): { start: Date; end: Date } | null => {
  const officialStart = parseCalendarDate(study.dateDebut);
  const officialEnd = parseCalendarDate(study.dateFin);
  if (officialStart && officialEnd) {
    return { start: officialStart, end: officialEnd };
  }

  const appointmentDates = appointments
    .map(({ date }) => parseCalendarDate(date))
    .filter((date): date is Date => date !== null);
  if (appointmentDates.length === 0) return null;

  return {
    start: new Date(Math.min(...appointmentDates.map((date) => date.getTime()))),
    end: new Date(Math.max(...appointmentDates.map((date) => date.getTime()))),
  };
};

export const dateFallsWithinPeriod = (dateValue: string | undefined, start: Date, end: Date): boolean => {
  const date = parseCalendarDate(dateValue);
  return date !== null && date >= start && date <= end;
};
