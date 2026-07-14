import { describe, expect, it } from 'vitest';
import { isSectionKey } from './index';

describe('volunteer detail section registry', () => {
  it('accepts only known lazy-loadable tabs', () => {
    expect(isSectionKey('info')).toBe(true);
    expect(isSectionKey('rdvs')).toBe(true);
    expect(isSectionKey('unknown-section')).toBe(false);
  });
});
