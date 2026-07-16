import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CheveuxSection from './CheveuxSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('CheveuxSection', () => {
  it('affiche la couleur de cheveux existante pendant la modification', () => {
    render(
      <CheveuxSection
        formData={{ couleurCheveux: 'Blond' }}
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('volunteers.hairColor')).toHaveValue('Blond');
  });
});
