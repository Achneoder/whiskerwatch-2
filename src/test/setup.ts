import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/svelte';
import '../lib/i18n';

afterEach(() => {
  cleanup();
});

