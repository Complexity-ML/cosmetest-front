import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock window.location
delete (window as any).location;
window.location = {
  href: '',
  pathname: '',
  search: '',
  hash: ''
} as any;

// Handle unhandled promise rejections in tests
const unhandledRejections: any[] = [];
process.on('unhandledRejection', (reason) => {
  // Suppress "Ressource non trouvée" errors which come from error interceptors in tests
  if (reason && typeof reason === 'string' && reason.includes('Ressource non trouvée')) {
    return;
  }
  unhandledRejections.push(reason);
});
