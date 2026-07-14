import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../../services/api';
import VolontairePhoto from './VolontairePhoto';

vi.mock('../../services/api', () => ({
  default: { get: vi.fn() }
}));

describe('VolontairePhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche photo indisponible sans signaler une erreur quand aucune photo n’existe', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { exists: false, photoUrl: null, message: 'La photo demandée n’existe pas' }
    });
    const onPhotoError = vi.fn();

    const { getByText } = render(
      <VolontairePhoto volontaireId={5196} onPhotoError={onPhotoError} />
    );

    await waitFor(() => expect(api.get).toHaveBeenCalledOnce());
    await waitFor(() => expect(getByText('Photo indisponible')).toBeInTheDocument());
    expect(onPhotoError).not.toHaveBeenCalled();
  });
});
