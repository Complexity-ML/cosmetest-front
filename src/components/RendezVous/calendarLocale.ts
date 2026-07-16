const CALENDAR_LOCALES: Record<string, string> = {
  fr: 'fr-FR',
  en: 'en-GB',
};

export const calendarLocaleForLanguage = (language?: string) =>
  CALENDAR_LOCALES[language?.split('-')[0] || 'fr'] || CALENDAR_LOCALES.fr;

export const formatCalendarDate = (
  date: Date,
  language: string | undefined,
  options: Intl.DateTimeFormatOptions,
) => date.toLocaleDateString(calendarLocaleForLanguage(language), options);
