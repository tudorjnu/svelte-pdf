import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

globalThis.BROWSER = false;

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

vi.mock('yoga-layout/load', () => import('./tests/yoga-shim.js'));
