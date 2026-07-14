import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemographicFilters } from './CriteriaComponents';
import etudeService from '../../services/etudeService';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => ({
      'reports.matching.demographicCriteria': 'Critères démographiques',
      'reports.matching.ageMin': 'Âge minimum',
      'reports.matching.ageMax': 'Âge maximum',
      'reports.matching.sex': 'Sexe',
      'reports.matching.all': 'Tous',
      'reports.matching.male': 'Masculin',
      'reports.matching.female': 'Féminin',
      'reports.matching.excludeStudy': 'Exclure une étude',
      'reports.matching.excludeStudyPlaceholder': 'Sélectionner une étude',
      'reports.matching.excludeStudyHint': 'Les volontaires déjà inscrits dans cette étude seront exclus des résultats.',
      'reports.matching.phototypes': 'Phototypes',
      'reports.matching.ethnicity': 'Ethnie',
    }[key] || key),
  }),
}));

vi.mock('../../services/etudeService', () => ({
  default: {
    getPaginated: vi.fn(),
  },
}));

const firstPage = Array.from({ length: 50 }, (_, index) => ({
  idEtude: index + 1,
  ref: `ET-${String(50 - index).padStart(3, '0')}`,
  titre: `Étude ${50 - index}`,
  dateDebut: `2026-01-${String((index % 28) + 1).padStart(2, '0')}`,
}));

const renderFilters = () => {
  const onAddExcludeRef = vi.fn();
  const props = {
    values: {
      ageMin: '18',
      ageMax: '80',
      sexe: '',
      phototypes: [],
      ethnies: [],
      typesPeau: [],
      excludeEtudeRefs: [],
    },
    onAgeChange: vi.fn(),
    onSexChange: vi.fn(),
    onPhototypeToggle: vi.fn(),
    onEthnieToggle: vi.fn(),
    onTypePeauToggle: vi.fn(),
    onAddExcludeRef,
    onRemoveExcludeRef: vi.fn(),
  };

  const rendered = render(<DemographicFilters {...props} />);
  return { ...rendered, props, onAddExcludeRef };
};

describe('DemographicFilters - exclusion des études', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("ne charge les études qu'à la première ouverture du sélecteur", async () => {
    vi.mocked(etudeService.getPaginated).mockResolvedValue({
      content: firstPage,
      totalElements: 50,
      totalPages: 1,
      size: 50,
      number: 0,
      last: true,
    });

    renderFilters();

    expect(etudeService.getPaginated).not.toHaveBeenCalled();

    const selector = screen.getByRole('combobox', { name: 'Exclure une étude' });
    fireEvent.click(selector);

    await waitFor(() => {
      expect(etudeService.getPaginated).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(selector);
    fireEvent.click(selector);

    expect(etudeService.getPaginated).toHaveBeenCalledTimes(1);
  });

  it('charge les 50 dernières études puis les 50 suivantes au clic', async () => {
    vi.mocked(etudeService.getPaginated)
      .mockResolvedValueOnce({
        content: firstPage,
        totalElements: 51,
        totalPages: 2,
        size: 50,
        number: 0,
        last: false,
      })
      .mockResolvedValueOnce({
        content: [{ idEtude: 51, ref: 'ET-000', titre: 'Étude ancienne', dateDebut: '2025-01-01' }],
        totalElements: 51,
        totalPages: 2,
        size: 50,
        number: 1,
        last: true,
      });

    renderFilters();

    fireEvent.click(screen.getByRole('combobox', { name: 'Exclure une étude' }));

    await waitFor(() => {
      expect(etudeService.getPaginated).toHaveBeenCalledWith(0, 50, 'dateDebut', 'DESC');
    });
    const studyMenu = await screen.findByTestId('exclude-study-menu');
    fireEvent.click(within(studyMenu).getByRole('button', { name: 'Charger plus' }));

    await waitFor(() => {
      expect(etudeService.getPaginated).toHaveBeenCalledWith(1, 50, 'dateDebut', 'DESC');
    });

    await waitFor(() => {
      expect(within(studyMenu).queryByRole('button', { name: 'Charger plus' })).not.toBeInTheDocument();
    });
  });

  it('permet de sélectionner plusieurs études en les ajoutant une par une', async () => {
    vi.mocked(etudeService.getPaginated).mockResolvedValue({
      content: firstPage,
      totalElements: 50,
      totalPages: 1,
      size: 50,
      number: 0,
      last: true,
    });

    const { onAddExcludeRef } = renderFilters();
    const selector = await screen.findByRole('combobox', { name: 'Exclure une étude' });
    const addButton = screen.getByRole('button', { name: 'Ajouter l’étude à exclure' });

    fireEvent.click(selector);
    fireEvent.click(await screen.findByRole('option', { name: /ET-050/ }));
    fireEvent.click(addButton);
    fireEvent.click(selector);
    fireEvent.click(await screen.findByRole('option', { name: /ET-049/ }));
    fireEvent.click(addButton);

    expect(onAddExcludeRef).toHaveBeenNthCalledWith(1, 'ET-050');
    expect(onAddExcludeRef).toHaveBeenNthCalledWith(2, 'ET-049');
  });
});
