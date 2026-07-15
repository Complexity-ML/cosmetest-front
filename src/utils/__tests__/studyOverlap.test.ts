import { describe, expect, it } from 'vitest';
import { dateFallsWithinPeriod, resolveStudyPeriod } from '../studyOverlap';

describe('studyOverlap', () => {
  it('utilise la période officielle de l’étude sans marge arbitraire', () => {
    const period = resolveStudyPeriod(
      { dateDebut: '2019-01-09', dateFin: '2019-01-09' },
      [{ date: '2019-09-09' }],
    );

    expect(period).not.toBeNull();
    expect(dateFallsWithinPeriod('2019-09-03', period!.start, period!.end)).toBe(false);
  });

  it('utilise les dates RDV seulement quand la période officielle est absente', () => {
    const period = resolveStudyPeriod({}, [{ date: '2026-07-27' }, { date: '2026-09-01' }]);

    expect(period).not.toBeNull();
    expect(dateFallsWithinPeriod('2026-08-15', period!.start, period!.end)).toBe(true);
    expect(dateFallsWithinPeriod('2019-09-03', period!.start, period!.end)).toBe(false);
  });
});
