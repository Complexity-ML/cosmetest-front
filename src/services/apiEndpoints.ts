export const dashboardEndpoints = {
  stats: '/dashboard/stats',
  prochainsRendezVous: '/dashboard/rdv/prochains',
  etudesRecentes: '/dashboard/etude/recentes',
  etudesEnCours: '/dashboard/etude/en-cours',
  activiteRecente: '/dashboard/activite/recente',
  statsJour: '/dashboard/stats-jour',
} as const;

export const panelEndpoint = (id: number | string): string => `/panels/${id}`;

export const identifiantEndpoints = {
  changePassword: (id: number | string): string =>
    `/identifiants/${id}/changer-mot-de-passe`,
} as const;

export const paiementEndpoints = {
  byStudy: (idEtude: number | string): string => `/etude-volontaires/etude/${idEtude}`,
  markAllPaid: (idEtude: number | string): string =>
    `/paiements/etudes/${idEtude}/mark-all-paid`,
} as const;
