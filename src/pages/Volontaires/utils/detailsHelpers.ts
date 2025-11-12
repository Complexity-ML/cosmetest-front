/**
 * Displays a value or returns '-' if the value is null, undefined, or empty string
 * @param value - The value to display
 * @returns The value as a string or '-'
 */
export const displayValue = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  return String(value);
};

/**
 * Converts boolean-like string values to 'Oui' or 'Non'
 * @param value - The value to convert ('Oui' or 'Non')
 * @returns 'Oui', 'Non', or '-'
 */
export const displayYesNo = (value: string | null | undefined): string => {
  if (value === 'Oui') return 'Oui';
  if (value === 'Non') return 'Non';
  return '-';
};

/**
 * Formats a date string to a compact French format (DD/MM/YYYY)
 * @param dateString - The date string to format
 * @returns Formatted date string or '-'
 */
export const formatCompactDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    return '-';
  }
};

