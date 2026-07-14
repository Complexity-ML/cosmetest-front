import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import PaymentsStudyTable from './PaymentsStudyTable';

const study = {
  idEtude: 42,
  ref: 'ETUDE-42',
  dateDebut: '2026-01-01',
  dateFin: '2026-02-01',
  paye: 0,
};

describe('PaymentsStudyTable', () => {
  it('affiche le résumé et délègue la sélection sans logique API', () => {
    const onSelect = vi.fn();

    render(
      <PaymentsStudyTable
        etudes={[study]}
        summaries={{
          42: {
            total: 3,
            payes: 1,
            nonPayes: 1,
            enAttente: 1,
            annules: 2,
            montantTotal: 150,
            montantPaye: 50,
          },
        }}
        isEtudeOverdue={() => false}
        formatDate={() => 'date formatée'}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText('ETUDE-42')).toBeInTheDocument();
    expect(screen.getByText('150 EUR')).toBeInTheDocument();
    fireEvent.click(screen.getByText('ETUDE-42'));
    expect(onSelect).toHaveBeenCalledWith(42);
  });
});
