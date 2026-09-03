import { vi } from 'vitest';
import createFetchMock from 'vitest-fetch-mock';

const fetchMocker = createFetchMock(vi);
fetchMocker.enableMocks();

globalThis.BROWSER = false;

vi.mock('yoga-layout/load', () => import('./tests/yoga-shim.js'));