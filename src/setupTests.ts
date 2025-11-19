import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock environment variables
vi.mock('import.meta.env', () => ({
  VITE_GOOGLE_API_KEY: 'test-api-key',
  VITE_GOOGLE_SEARCH_ID: 'test-search-id',
  VITE_FIREBASE_API_KEY: 'test-firebase-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
globalThis.IntersectionObserver = class IntersectionObserver
  implements IntersectionObserver
{
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;
