import { describe, expect, it } from 'vitest';

import {
  buildPassageAverageWarning,
  getAppointmentIdentity,
  getAssignedVolunteerId,
} from './appointmentPassageGuard';

describe('appointmentPassageGuard', () => {
  it('normalise les identifiants issus des formats de rendez-vous du backend', () => {
    expect(getAppointmentIdentity({ idRdv: 42, id: 7 })).toBe('42');
    expect(getAppointmentIdentity({ id: '7' })).toBe('7');
    expect(getAssignedVolunteerId({ idVolontaire: '12' })).toBe(12);
    expect(getAssignedVolunteerId({ volontaire: { idVol: '13' } })).toBe(13);
  });

  it('ignore les affectations dont le volontaire ou le rendez-vous est invalide', () => {
    const warning = buildPassageAverageWarning(
      [
        { idRdv: 1, idVolontaire: 10 },
        { idRdv: 2, idVolontaire: 20 },
      ],
      [
        { appointment: { idRdv: 3 }, volunteerId: null },
        { appointment: { idRdv: 4 }, volunteerId: 'invalide' },
        { appointment: {}, volunteerId: 10 },
      ],
    );

    expect(warning).toBeNull();
  });

  it('avertit quand une affectation augmente les passages au-dessus de la moyenne', () => {
    const warning = buildPassageAverageWarning(
      [
        { idRdv: 1, idVolontaire: 10 },
        { idRdv: 2, idVolontaire: 20 },
      ],
      [
        { appointment: { idRdv: 3 }, volunteerId: 10, volunteerName: 'Alice Martin' },
      ],
    );

    expect(warning).toContain('Moyenne actuelle : 1 passage(s) par volontaire.');
    expect(warning).toContain('- Alice Martin aura 2 passage(s) sur cette etude.');
  });

  it('ne liste un volontaire qu’une fois quand plusieurs affectations le concernent', () => {
    const warning = buildPassageAverageWarning(
      [
        { idRdv: 1, idVolontaire: 10 },
        { idRdv: 2, idVolontaire: 20 },
      ],
      [
        { appointment: { idRdv: 3 }, volunteerId: 10, volunteerName: 'Alice Martin' },
        { appointment: { idRdv: 4 }, volunteerId: 10, volunteerName: 'Alice Martin' },
      ],
    );

    expect(warning?.match(/Alice Martin/g)).toHaveLength(1);
    expect(warning).toContain('aura 3 passage(s)');
  });
});
