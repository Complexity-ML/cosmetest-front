import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import IndemniteManager from './IndemniteManager';
import api from '../../services/api';
import etudeVolontaireService from '../../services/etudeVolontaireService';
import groupeService from '../../services/groupeService';

const loadGroupesInfo = vi.fn().mockResolvedValue(undefined);
const loadVolontairesInfo = vi.fn().mockResolvedValue(undefined);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../../services/api', () => ({
  default: { post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

vi.mock('../../services/etudeVolontaireService', () => ({
  default: {
    getVolontairesByEtude: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../services/groupeService', () => ({
  default: { getById: vi.fn() },
}));

vi.mock('../../services/annulationService', () => ({
  default: { createWithValidation: vi.fn() },
}));

vi.mock('./indemnite/useEntitiesInfo', () => ({
  useEntitiesInfo: () => ({
    volontairesInfo: {},
    loadGroupesInfo,
    loadVolontairesInfo,
  }),
}));

vi.mock('./indemnite/InputComponents', () => ({
  NumSujetInput: () => null,
  IVInput: () => null,
}));
vi.mock('./indemnite/StatutDisplay', () => ({ default: () => null }));
vi.mock('./indemnite/ActionButtons', () => ({
  AnnulationButton: () => null,
  DeleteButton: () => null,
}));
vi.mock('./indemnite/BatchActions', () => ({ default: () => null }));

describe('IndemniteManager - chargement des associations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.post).mockResolvedValue({ data: { repaired: 2, missing: 2 } });
    vi.mocked(etudeVolontaireService.getVolontairesByEtude).mockResolvedValue([]);
  });

  it("reste en lecture seule même si des RDV n'ont pas d'association", async () => {
    const rdvs = [
      { idVolontaire: 101, idGroupe: 11 },
      { idVolontaire: 102, idGroupe: 11 },
    ];

    render(
      <IndemniteManager
        etudeId={7}
        etudeTitre="Étude test"
        rdvs={rdvs as never}
      />
    );

    await waitFor(() => {
      expect(etudeVolontaireService.getVolontairesByEtude).toHaveBeenCalledTimes(1);
    });

    expect(api.post).not.toHaveBeenCalled();
    expect(etudeVolontaireService.create).not.toHaveBeenCalled();
    expect(groupeService.getById).not.toHaveBeenCalled();
  });

  it('compte 32 personnes et non 62 lignes quand 30 anciennes associations sans numéro sont présentes', async () => {
    const associations = Array.from({ length: 32 }, (_, index) => ({
      id: index + 1,
      idEtude: 2171,
      idGroupe: 10,
      idVolontaire: index + 100,
      numsujet: index + 1,
      iv: 60,
      paye: 0,
      statut: 'INSCRIT',
    }));
    associations.push({
      id: 999,
      idEtude: 2171,
      idGroupe: 10,
      idVolontaire: 999,
      numsujet: 99,
      iv: 60,
      paye: 0,
      statut: 'INSCRIT',
    });
    associations.push(...associations.slice(0, 30).map((row, index) => ({
      ...row,
      id: 1000 + index,
      numsujet: 0,
    })));
    vi.mocked(etudeVolontaireService.getVolontairesByEtude).mockResolvedValue(associations);

    render(
      <IndemniteManager
        etudeId={2171}
        etudeTitre="2915 IN USE"
        rdvs={associations.slice(0, 32) as never}
      />
    );

    expect(await screen.findByText('1920 €')).toBeInTheDocument();
    expect(screen.getByText(/30 anciennes lignes sans numéro sujet/)).toBeInTheDocument();
    expect(screen.queryByText('3720 €')).not.toBeInTheDocument();
  });
});
