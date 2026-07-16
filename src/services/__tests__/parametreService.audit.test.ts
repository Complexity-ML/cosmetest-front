import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '../api';
import parametreService from '../parametreService';

vi.mock('../api', () => ({
  default: { get: vi.fn(), delete: vi.fn() },
}));

describe('parametreService.getAuditLogs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.get).mockResolvedValue({ data: { content: [] } });
    vi.mocked(api.delete).mockResolvedValue({ data: { deleted: 3 } });
  });

  it('transmet le filtre action avec les dates et l’utilisateur', async () => {
    await parametreService.getAuditLogs(
      0,
      50,
      undefined,
      'alice',
      '2026-07-01',
      '2026-07-16',
      'DELETE',
    );

    expect(api.get).toHaveBeenCalledWith(
      '/audit?page=0&size=50&utilisateur=alice&dateDebut=2026-07-01&dateFin=2026-07-16&action=DELETE',
    );
  });

  it("purge l'historique des sessions avant la date sélectionnée", async () => {
    await parametreService.purgeSessionHistory('2026-01-01');

    expect(api.delete).toHaveBeenCalledWith(
      '/connexions/session-history/purge?before=2026-01-01',
    );
  });
});
