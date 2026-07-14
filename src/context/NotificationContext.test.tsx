import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationProvider, useNotifications } from './NotificationContext';
import notificationService from '../services/notificationService';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { login: 'admin', role: 2 } }),
}));

vi.mock('../services/notificationService', () => ({
  default: { getToday: vi.fn() },
}));

const Consumer = () => {
  const context = useNotifications();
  return (
    <div>
      <span data-testid="unread">{context.unreadVolunteersCount}</span>
      <span data-testid="ids">{context.volunteersToday.map((item) => item.id).join(',')}</span>
      <button onClick={() => context.dismissNotification(1)}>dismiss-one</button>
      <button onClick={context.markVolunteersAsConsulted}>mark-all</button>
    </div>
  );
};

const response = {
  data: [
    { id: 1, nom: 'Martin', prenom: 'Léa', dateInclusion: '2026-07-14' },
    { id: 2, nom: 'Durand', prenom: 'Sam', dateInclusion: '2026-07-14' },
  ],
  total: 2,
  date: '2026-07-14',
};

describe('NotificationProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(notificationService.getToday).mockReset();
    vi.mocked(notificationService.getToday).mockResolvedValue(response);
  });

  it('loads from the authenticated user without inspecting document.cookie', async () => {
    render(<NotificationProvider><Consumer /></NotificationProvider>);

    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('2'));
    expect(notificationService.getToday).toHaveBeenCalledWith(50);
  });

  it('dismisses only the selected volunteer and persists state per user and date', async () => {
    render(<NotificationProvider><Consumer /></NotificationProvider>);
    await waitFor(() => expect(screen.getByTestId('ids')).toHaveTextContent('1,2'));

    fireEvent.click(screen.getByText('dismiss-one'));

    expect(screen.getByTestId('ids')).toHaveTextContent('2');
    expect(screen.getByTestId('unread')).toHaveTextContent('1');
    expect(localStorage.getItem('cosmetest.notifications.v1.admin.2026-07-14')).toContain('"dismissedIds":[1]');
  });

  it('marks visible notifications as read without removing them', async () => {
    render(<NotificationProvider><Consumer /></NotificationProvider>);
    await waitFor(() => expect(screen.getByTestId('unread')).toHaveTextContent('2'));

    fireEvent.click(screen.getByText('mark-all'));

    expect(screen.getByTestId('unread')).toHaveTextContent('0');
    expect(screen.getByTestId('ids')).toHaveTextContent('1,2');
  });
});
