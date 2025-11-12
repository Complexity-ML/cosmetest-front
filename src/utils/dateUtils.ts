// src/utils/dateUtils.ts

/**
 * Calendar Day Interface
 */
export interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
}

/**
 * Formate une date au format français (JJ/MM/AAAA)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return typeof date === 'string' ? date : '';
    }

    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return typeof date === 'string' ? date : '';
  }
};

/**
 * Formate une date et heure au format français
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return typeof date === 'string' ? date : '';
    }

    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date et heure:', error);
    return typeof date === 'string' ? date : '';
  }
};

/**
 * Formate l'heure d'une date (HH:MM)
 */
export const formatTime = (time: string | Date | null | undefined): string => {
  if (!time) return '-';

  try {
    // Si c'est déjà une string au format HH:MM, la retourner directement
    if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
      return time;
    }

    // Si c'est une string qui ressemble à une heure (ex: "14:30:00")
    if (typeof time === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5); // Retourner seulement HH:MM
    }

    // Essayer de parser comme une date
    const dateObj = time instanceof Date ? time : new Date(time);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return typeof time === 'string' ? time : '-';
    }

    return dateObj.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de l\'heure:', error);
    return typeof time === 'string' ? time : '-';
  }
};

/**
 * Convertit une date au format ISO (YYYY-MM-DD)
 */
export const toISODateString = (date: Date | string | null | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return '';
    }

    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erreur lors de la conversion de la date en ISO:', error);
    return '';
  }
};

/**
 * Calcule l'âge à partir d'une date de naissance
 */
export const calculateAge = (dateNaissance: string | Date | null | undefined): number | null => {
  if (!dateNaissance) return null;

  try {
    const birthDate = new Date(dateNaissance);

    // Vérifier si la date est valide
    if (isNaN(birthDate.getTime())) {
      return null;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    // Si le mois de naissance n'est pas encore passé ou si c'est le même mois
    // mais que le jour n'est pas encore passé, on retire 1 an
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    console.error('Erreur lors du calcul de l\'âge:', error);
    return null;
  }
};

/**
 * Calcule l'âge à partir d'une date de naissance (alias pour calculateAge)
 */
export const calculateAgeFromDate = (dateOfBirth: string | Date | null | undefined): number | null => {
  return calculateAge(dateOfBirth);
};

/**
 * Ajoute des jours à une date
 */
export const addDays = (date: Date | string | null | undefined, days: number): Date | null => {
  if (!date) return null;

  try {
    const dateObj = date instanceof Date ? new Date(date) : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return null;
    }

    dateObj.setDate(dateObj.getDate() + days);
    return dateObj;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de jours à la date:', error);
    return null;
  }
};

/**
 * Formate une date au format long français (Lundi 01 janvier 2023)
 */
export const formatLongDate = (date: string | Date | null | undefined): string => {
  if (!date) return '';

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return typeof date === 'string' ? date : '';
    }

    return dateObj.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Erreur lors du formatage de la date longue:', error);
    return typeof date === 'string' ? date : '';
  }
};

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;

  try {
    const dateObj = date instanceof Date ? date : new Date(date);

    // Vérifier si la date est valide
    if (isNaN(dateObj.getTime())) {
      return false;
    }

    const today = new Date();
    return dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();
  } catch (error) {
    console.error('Erreur lors de la vérification si date est aujourd\'hui:', error);
    return false;
  }
};

/**
 * Vérifie si une date tombe un week-end (samedi ou dimanche)
 */
export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
};

/**
 * Vérifie si deux dates sont le même jour
 */
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

/**
 * Génère les jours pour un affichage de calendrier
 */
export const getCalendarDays = (date: Date | string, offset: number = 0): CalendarDay[] => {
  const currentDate = date instanceof Date ? new Date(date) : new Date();

  // Appliquer le décalage de mois
  currentDate.setMonth(currentDate.getMonth() + offset);

  // Premier jour du mois
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Dernier jour du mois
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Jour de la semaine du premier jour (0 = dimanche, 1 = lundi, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();

  // Adapter pour commencer la semaine le lundi (0 = lundi, 6 = dimanche)
  const adjustedFirstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  // Nombre de jours dans le mois
  const daysInMonth = lastDayOfMonth.getDate();

  // Tableau qui contiendra tous les jours du calendrier
  const calendarDays: CalendarDay[] = [];

  // Jours du mois précédent pour compléter la première semaine
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
  const daysInPrevMonth = prevMonth.getDate();

  for (let i = adjustedFirstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day);
    calendarDays.push({
      date: dayDate,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(dayDate, new Date()),
      isWeekend: isWeekend(dayDate)
    });
  }

  // Jours du mois courant
  const today = new Date();
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    calendarDays.push({
      date: dayDate,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(dayDate, today),
      isWeekend: isWeekend(dayDate)
    });
  }

  // Jours du mois suivant pour compléter la dernière semaine
  const remainingDays = 42 - calendarDays.length; // 6 semaines complètes (6x7=42)
  for (let day = 1; day <= remainingDays; day++) {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day);
    calendarDays.push({
      date: dayDate,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(dayDate, today),
      isWeekend: isWeekend(dayDate)
    });
  }

  return calendarDays;
};

// Export par défaut avec toutes les fonctions
export default {
  formatDate,
  formatDateTime,
  formatTime,
  toISODateString,
  calculateAge,
  calculateAgeFromDate,
  addDays,
  formatLongDate,
  isToday,
  isWeekend,
  isSameDay,
  getCalendarDays
};
