import geographyData from '../src/data/geography.json';
import { initAddressData } from '../src/data/addresses';

const originalFetch = global.fetch;

beforeAll(async () => {
  // Mock fetch to avoid network calls during tests and serve bundled geography data instead.
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => geographyData,
  }) as unknown as typeof fetch;

  await initAddressData();
});

afterAll(() => {
  global.fetch = originalFetch;
});

