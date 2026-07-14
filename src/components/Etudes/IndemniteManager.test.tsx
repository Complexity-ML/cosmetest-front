import { render, waitFor } from '@testing-library/react';
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
});
