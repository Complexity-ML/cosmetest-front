import MockAdapter from 'axios-mock-adapter';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../api', async () => {
  const axios = await import('axios');
  return { default: axios.default.create({ baseURL: '/api/v1' }) };
});

import api from '../api';
import notificationService from '../notificationService';

describe('notificationService', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(api);
  });

  it('loads the bounded today endpoint', async () => {
    mock.onGet('/volontaires/notifications/today', { params: { limit: 50 } }).reply(200, {
      data: [{ id: 7, nom: 'Martin', prenom: 'Léa', dateInclusion: '2026-07-14' }],
      total: 1,
      date: '2026-07-14',
    });

    const result = await notificationService.getToday(50);

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe(7);
  });
});
