import { describe, expect, it } from 'vitest';
import fr from '../locales/fr/translation.json';
import en from '../locales/en/translation.json';

const flattenKeys = (value: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? flattenKeys(child as Record<string, unknown>, path)
      : [path];
  });

describe('translation catalogs', () => {
  it('expose les mêmes clés en français et en anglais', () => {
    expect(flattenKeys(fr).sort()).toEqual(flattenKeys(en).sort());
  });
});
