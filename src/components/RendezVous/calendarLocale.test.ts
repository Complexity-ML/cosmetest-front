import { describe, expect, it } from 'vitest';
import { calendarLocaleForLanguage, formatCalendarDate } from './calendarLocale';

describe('calendar locale', () => {
  it('utilise la langue active pour les mois et les dates longues', () => {
    const date = new Date(2026, 6, 15);

    expect(calendarLocaleForLanguage('fr')).toBe('fr-FR');
    expect(calendarLocaleForLanguage('en')).toBe('en-GB');
    expect(formatCalendarDate(date, 'fr', { month: 'long', year: 'numeric' })).toBe('juillet 2026');
    expect(formatCalendarDate(date, 'en', { month: 'long', year: 'numeric' })).toBe('July 2026');
  });

  it('retombe sur le français pour une langue inconnue', () => {
    expect(calendarLocaleForLanguage('de')).toBe('fr-FR');
  });
});
