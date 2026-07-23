import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import VolunteerExcelExport from './VolunteerExcelExport';
import api from '../../services/api';
import etudeService from '../../services/etudeService';
import volontaireService from '../../services/volontaireService';

const xlsxState = vi.hoisted(() => ({
  rows: [] as unknown[][],
  writeFile: vi.fn(),
}));

vi.mock('xlsx', async (importOriginal) => {
  const actual = await importOriginal<typeof import('xlsx')>();

  return {
    ...actual,
    utils: {
      ...actual.utils,
      aoa_to_sheet: vi.fn((rows: unknown[][]) => {
        xlsxState.rows = rows;
        return actual.utils.aoa_to_sheet(rows);
      }),
    },
    writeFile: xlsxState.writeFile,
  };
});

vi.mock('../../services/volontaireService', () => ({
  default: {
    getDetails: vi.fn(),
  },
}));

vi.mock('../../services/etudeService', () => ({
  default: {
    getById: vi.fn(),
  },
}));

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('VolunteerExcelExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    xlsxState.rows = [];

    vi.mocked(etudeService.getById).mockResolvedValue({
      idEtude: 10,
      refEtude: 'TEST-10',
    } as never);

    vi.mocked(volontaireService.getDetails).mockResolvedValue({
      data: {
        idVol: 7,
        dateNaissance: '1990-01-01',
        typePeauVisage: 'Normale',
        sensibiliteCutanee: 'Peau non sensible',
        phototype: 'III',
        ethnie: 'Africaine,Caucasienne',
      },
    } as never);

    vi.mocked(api.get).mockImplementation(async (url: string) => {
      if (url === '/etude-volontaires/etude/10') {
        return { data: [{ idVolontaire: 7, numsujet: 1 }] } as never;
      }
      if (url.startsWith('/rdvs/search')) {
        return { data: [] } as never;
      }
      throw new Error(`URL inattendue: ${url}`);
    });
  });

  it('exports the second main ethnicity in ETHNIE 2 without including it in statistics', async () => {
    render(
      <VolunteerExcelExport
        volunteerIds={[7]}
        studyId={10}
        studyRef="TEST-10"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Export Données Démographiques/i }));

    await waitFor(() => expect(xlsxState.writeFile).toHaveBeenCalledOnce());

    const headers = xlsxState.rows[1];
    const volunteerRow = xlsxState.rows[3];
    const ethnicityHeaderIndex = headers.indexOf('ETHNIE');

    expect(headers.slice(ethnicityHeaderIndex, ethnicityHeaderIndex + 2)).toEqual([
      'ETHNIE',
      'ETHNIE 2',
    ]);
    expect(volunteerRow.slice(ethnicityHeaderIndex, ethnicityHeaderIndex + 2)).toEqual([
      'African',
      'Caucasian',
    ]);

    expect(xlsxState.rows.find((row) => row[0] === 'African')?.[1]).toBe(1);
    expect(xlsxState.rows.find((row) => row[0] === 'Caucasian')?.[1]).toBe(0);
  });
});
