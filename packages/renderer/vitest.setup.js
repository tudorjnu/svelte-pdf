import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

globalThis.BROWSER = false;

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

// examples/AllFeatures.svelte registers its custom fonts from
// fonts.gstatic.com, but this suite must run hermetically (sandbox/CI
// without internet). Serve those URLs from a local TTF fixture — a valid
// latin TTF is enough because the test only asserts a successful render,
// not specific metrics. Every other mocked fetch keeps the library's
// default empty-200 response.
const here = dirname(fileURLToPath(import.meta.url));
const fontFixture = readFileSync(
  resolve(here, '../engine/tests/layout/assets/font.ttf'),
);

fetchMocker.mockImplementation((input) => {
  const url = typeof input === 'string' ? input : String(input.url ?? input);
  return Promise.resolve(
    new Response(/fonts\.gstatic\.com/.test(url) ? fontFixture : ''),
  );
});

vi.mock('yoga-layout/load', () => import('./tests/yoga-shim.js'));
