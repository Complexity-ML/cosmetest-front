import { describe, expect, it } from 'vitest';
import { normalizeIndemnityAssociations } from './associationNormalization';
import type { VolontaireAssigne } from './types';

const association = (
  id: number,
  idVolontaire: number,
  numsujet: number,
  overrides: Partial<VolontaireAssigne> = {},
): VolontaireAssigne => ({
  id,
  idEtude: 2171,
  idGroupe: 10,
  idVolontaire,
  numsujet,
  iv: 60,
  paye: 0,
  statut: 'INSCRIT',
  ...overrides,
});

describe('normalizeIndemnityAssociations', () => {
  it('compte une seule personne quand une ancienne ligne sans numéro sujet double la ligne valide', () => {
    const result = normalizeIndemnityAssociations([
      association(1, 101, 0),
      association(2, 101, 12),
      association(3, 102, 13),
    ]);

    expect(result.associations).toEqual([
      association(2, 101, 12),
      association(3, 102, 13),
    ]);
    expect(result.ignoredLegacyRows).toBe(1);
    expect(result.ambiguousVolunteerCount).toBe(0);
  });

  it('ne masque pas des lignes financièrement différentes', () => {
    const rows = [
      association(1, 101, 0),
      association(2, 101, 12, { iv: 80 }),
    ];

    const result = normalizeIndemnityAssociations(rows);

    expect(result.associations).toEqual(rows);
    expect(result.ignoredLegacyRows).toBe(0);
    expect(result.ambiguousVolunteerCount).toBe(1);
  });
});
