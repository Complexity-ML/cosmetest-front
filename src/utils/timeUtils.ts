// Utils de manipulation d'heures pour RDV
// Gère: "09h00", "09:00", "900", "9h", etc.

export const timeToMinutes = (value: string | number | null | undefined): number => {
  if (!value) return 0;
  let s = String(value).trim();
  s = s.replace(/\s+/g, '');      // supprimer espaces
  s = s.replace(/[hH]/, ':');      // remplacer h par :
  s = s.replace(/[^0-9:]/g, '');   // conserver chiffres et ':'

  if (s.includes(':')) {
    const [hRaw, mRaw = '0'] = s.split(':');
    const h = parseInt(hRaw, 10);
    const m = parseInt(mRaw, 10) || 0;
    if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
  }

  const digits = s.replace(/[^0-9]/g, '');
  if (digits.length >= 3 && digits.length <= 4) {
    const h = parseInt(digits.slice(0, -2), 10);
    const m = parseInt(digits.slice(-2), 10) || 0;
    if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
  }

  if (digits.length > 0) {
    const h = parseInt(digits, 10);
    if (Number.isFinite(h)) return h * 60;
  }
  return 0;
};

export const normalizeTime = (value: string | number | null | undefined): string => {
  if (!value) return '';
  const total = timeToMinutes(value);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
