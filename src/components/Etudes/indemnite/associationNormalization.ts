import type { VolontaireAssigne } from './types';

export interface NormalizedIndemnityAssociations {
  associations: VolontaireAssigne[];
  ignoredLegacyRows: number;
  ambiguousVolunteerCount: number;
}

const hasSameBusinessState = (rows: VolontaireAssigne[]) => {
  const first = rows[0];
  return rows.every((row) =>
    row.idEtude === first.idEtude
    && row.idGroupe === first.idGroupe
    && row.idVolontaire === first.idVolontaire
    && row.iv === first.iv
    && row.paye === first.paye
    && row.statut === first.statut
  );
};

export const normalizeIndemnityAssociations = (
  rows: VolontaireAssigne[],
): NormalizedIndemnityAssociations => {
  const byVolunteer = new Map<string, VolontaireAssigne[]>();

  rows.forEach((row) => {
    const key = `${row.idEtude}:${row.idVolontaire}`;
    const group = byVolunteer.get(key) || [];
    group.push(row);
    byVolunteer.set(key, group);
  });

  const associations: VolontaireAssigne[] = [];
  let ignoredLegacyRows = 0;
  let ambiguousVolunteerCount = 0;

  byVolunteer.forEach((group) => {
    if (group.length === 1) {
      associations.push(group[0]);
      return;
    }

    const numberedRows = group.filter((row) => Number(row.numsujet) > 0);
    const unnumberedRows = group.filter((row) => Number(row.numsujet) === 0);
    const canCollapseLegacyRows = hasSameBusinessState(group)
      && numberedRows.length === 1
      && numberedRows.length + unnumberedRows.length === group.length;

    if (canCollapseLegacyRows) {
      associations.push(numberedRows[0]);
      ignoredLegacyRows += unnumberedRows.length;
      return;
    }

    associations.push(...group);
    ambiguousVolunteerCount += 1;
  });

  return { associations, ignoredLegacyRows, ambiguousVolunteerCount };
};
