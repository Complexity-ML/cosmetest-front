import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AnnulationsSection from './AnnulationsSection';
import annulationService from '../../../services/annulationService';
import etudeService from '../../../services/etudeService';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

vi.mock('../../../services/annulationService', () => ({
  default: {
    getRecentByVolontaire: vi.fn(),
    update: vi.fn(),
    undo: vi.fn(),
  },
}));

vi.mock('../../../services/etudeService', () => ({
  default: { getById: vi.fn() },
}));

describe('AnnulationsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(annulationService.getRecentByVolontaire).mockResolvedValue([{
      idAnnuler: 77,
      idVol: 10,
      idEtude: 20,
      dateAnnulation: '2026-07-20',
      commentaire: 'Indisponible',
      annulePar: 'VOLONTAIRE',
    }]);
    vi.mocked(etudeService.getById).mockResolvedValue({ ref: 'E-20' } as never);
    vi.mocked(annulationService.undo).mockResolvedValue({
      idAnnulation: 77,
      idVol: 10,
      idEtude: 20,
      restoredRdvCount: 3,
    });
    vi.mocked(annulationService.update).mockImplementation(async (_id, data) => ({
      idAnnuler: 77,
      idVol: 10,
      idEtude: 20,
      dateAnnulation: '2026-07-20',
      commentaire: data.commentaire || '',
      annulePar: data.annulePar,
    }));
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('affiche aussi les annulations faites par Cosmetest', async () => {
    vi.mocked(annulationService.getRecentByVolontaire).mockResolvedValue([{
      idAnnuler: 78,
      idVol: 10,
      idEtude: 20,
      dateAnnulation: '2026-07-21',
      commentaire: 'Décision du centre',
      annulePar: 'COSMETEST',
    }]);

    render(<AnnulationsSection volontaireId={10} />);

    expect(await screen.findByText('Décision du centre')).toBeInTheDocument();
    expect(screen.getByText('Cosmetest')).toBeInTheDocument();
  });

  it("modifie le motif et l'origine d'une annulation", async () => {
    render(<AnnulationsSection volontaireId={10} />);

    fireEvent.click(await screen.findByRole('button', { name: /Modifier l'annulation/i }));
    fireEvent.change(screen.getByLabelText("Motif de l'annulation"), {
      target: { value: 'Erreur de planning' },
    });
    fireEvent.click(screen.getByLabelText('Cosmetest'));
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }));

    await waitFor(() => {
      expect(annulationService.update).toHaveBeenCalledWith(77, expect.objectContaining({
        commentaire: 'Erreur de planning',
        annulePar: 'COSMETEST',
      }));
    });
    expect(await screen.findByText('Erreur de planning')).toBeInTheDocument();
    expect(screen.getByText('Cosmetest')).toBeInTheDocument();
  });

  it("annule une annulation et affiche le nombre d'horaires restaurés", async () => {
    render(<AnnulationsSection volontaireId={10} />);

    fireEvent.click(await screen.findByRole('button', { name: /Annuler l'annulation/i }));

    await waitFor(() => {
      expect(annulationService.undo).toHaveBeenCalledWith(77);
    });
    expect(window.confirm).toHaveBeenCalled();
    expect(await screen.findByText('3 rendez-vous restaurés.')).toBeInTheDocument();
    expect(screen.queryByText('Indisponible')).not.toBeInTheDocument();
  });
});
