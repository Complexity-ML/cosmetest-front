import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Dashboard from './Dashboard';
import api from '../../services/api';
import { dashboardEndpoints } from '../../services/apiEndpoints';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../services/api', () => ({
  default: { get: vi.fn() },
}));

const renderDashboard = () => render(
  <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <Dashboard />
  </MemoryRouter>
);

const responseFor = (endpoint: string) => {
  if (endpoint === dashboardEndpoints.stats) {
    return { data: { volontairesActifs: 1, etudesEnCours: 2, rdvToday: 3 } };
  }
  if (endpoint === dashboardEndpoints.statsJour) {
    return { data: { volontairesAjoutes: 1, rdvEffectues: 2, nouvellesPreinscriptions: 3 } };
  }
  return { data: [] };
};

describe('Dashboard - chargement des sections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('lance les six requêtes sans attendre la résolution des précédentes', async () => {
    const pending = new Promise(() => undefined);
    vi.mocked(api.get).mockReturnValue(pending as ReturnType<typeof api.get>);

    renderDashboard();

    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(6));
    expect(vi.mocked(api.get).mock.calls.map(([endpoint]) => endpoint)).toEqual([
      dashboardEndpoints.stats,
      dashboardEndpoints.prochainsRendezVous,
      dashboardEndpoints.etudesRecentes,
      dashboardEndpoints.etudesEnCours,
      dashboardEndpoints.activiteRecente,
      dashboardEndpoints.statsJour,
    ]);
  });

  it("conserve l'erreur de la section études en cours quand les autres réussissent", async () => {
    vi.mocked(api.get).mockImplementation(async (endpoint) => {
      if (endpoint === dashboardEndpoints.etudesEnCours) {
        throw new Error('section indisponible');
      }
      return responseFor(String(endpoint));
    });

    renderDashboard();

    expect(await screen.findByText('dashboard.partialLoadError')).toBeInTheDocument();
    expect(screen.getByText(/dashboard\.ongoingStudies/, { selector: 'li' })).toBeInTheDocument();
    expect(screen.queryByText('dashboard.loadError')).not.toBeInTheDocument();
  });
});
