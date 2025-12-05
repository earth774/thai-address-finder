import type { ThaiAddress } from '../src/types/address';

describe('addresses data loading', () => {
  const sampleGeography = [
    {
      provinceNameTh: 'Bangkok',
      districtNameTh: 'Pathum Wan',
      subdistrictNameTh: 'Lumphini',
      postalCode: 10330,
    },
  ];

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('loads geography once and caches results in Node environments', async () => {
    const mockExistsSync = jest.fn().mockReturnValue(true);
    const mockReadFileSync = jest
      .fn()
      .mockReturnValue(JSON.stringify(sampleGeography));

    jest.doMock('fs', () => ({
      __esModule: true,
      default: {
        existsSync: mockExistsSync,
        readFileSync: mockReadFileSync,
      },
      existsSync: mockExistsSync,
      readFileSync: mockReadFileSync,
    }));

    const addressesModule = await import('../src/data/addresses');
    const { loadAddresses, getAddresses, addresses } = addressesModule;

    const expected: ThaiAddress[] = [
      {
        province: 'Bangkok',
        district: 'Pathum Wan',
        subDistrict: 'Lumphini',
        postalCode: '10330',
      },
    ];

    const firstLoad = loadAddresses();
    expect(firstLoad).toEqual(expected);
    expect(mockReadFileSync).toHaveBeenCalledTimes(1);

    const secondLoad = loadAddresses();
    expect(mockReadFileSync).toHaveBeenCalledTimes(1);
    expect(secondLoad).toBe(firstLoad);
    expect(getAddresses()).toBe(firstLoad);
    expect(addresses).toBe(firstLoad);
  });

  it('throws a helpful error when geography data is missing', async () => {
    const mockExistsSync = jest.fn().mockReturnValue(false);

    jest.doMock('fs', () => ({
      __esModule: true,
      default: {
        existsSync: mockExistsSync,
        readFileSync: jest.fn(),
      },
      existsSync: mockExistsSync,
      readFileSync: jest.fn(),
    }));

    await expect(import('../src/data/addresses')).rejects.toThrow(
      'Geography data file not found'
    );
  });

  it('fetches and normalizes baseUrl in non-Node environments', async () => {
    const originalProcess = global.process;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).process = undefined;

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleGeography,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    try {
      const addressesModule = await import('../src/data/addresses');
      const { initAddressData, getAddresses } = addressesModule;

      const data = await initAddressData({
        baseUrl: 'https://example.com/data/',
      });

      expect(fetchMock).toHaveBeenCalledWith(
        'https://example.com/data/geography.json'
      );
      expect(data[0]).toMatchObject({
        province: 'Bangkok',
        district: 'Pathum Wan',
        subDistrict: 'Lumphini',
        postalCode: '10330',
      });
      expect(getAddresses()).toEqual(data);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).process = originalProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).fetch;
    }
  });

  it('kicks off async loading when getAddresses is called in non-Node environments', async () => {
    const originalProcess = global.process;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).process = undefined;

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleGeography,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    try {
      const addressesModule = await import('../src/data/addresses');
      const { getAddresses, initAddressData } = addressesModule;

      const initial = getAddresses();
      expect(initial).toEqual([]);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      const resolved = await initAddressData();
      expect(resolved).toHaveLength(1);
      expect(getAddresses()).toEqual(resolved);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).process = originalProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).fetch;
    }
  });

  it('uses env base URL and trims trailing slash when no override is provided', async () => {
    const originalProcess = global.process;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).process = { env: { THAI_ADDRESS_DATA_URL: 'https://env.example.com/data/' } };

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleGeography,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    try {
      const addressesModule = await import('../src/data/addresses');
      const { initAddressData } = addressesModule;

      await initAddressData();

      expect(fetchMock).toHaveBeenCalledWith('https://env.example.com/data/geography.json');
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).process = originalProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).fetch;
    }
  });

  it('throws when fetch is missing in non-Node environments', async () => {
    const originalProcess = global.process;
    const originalFetch = globalThis.fetch;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).process = undefined;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).fetch;

    try {
      const addressesModule = await import('../src/data/addresses');
      const { initAddressData } = addressesModule;

      await expect(initAddressData()).rejects.toThrow('Global fetch is not available');
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).process = originalProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).fetch = originalFetch;
    }
  });

  it('propagates fetch errors and allows retry after failure', async () => {
    const originalProcess = global.process;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).process = undefined;

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => sampleGeography,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => sampleGeography,
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    try {
      const addressesModule = await import('../src/data/addresses');
      const { initAddressData } = addressesModule;

      await expect(initAddressData()).rejects.toThrow('Failed to fetch');
      const data = await initAddressData();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(data).toHaveLength(1);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).process = originalProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).fetch;
    }
  });

  it('reuses the in-flight load promise for concurrent calls', async () => {
    const originalProcess = global.process;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).process = undefined;

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => sampleGeography,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = fetchMock;

    try {
      const addressesModule = await import('../src/data/addresses');
      const { initAddressData } = addressesModule;

      const [dataA, dataB] = await Promise.all([initAddressData(), initAddressData()]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(dataA).toBe(dataB);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (global as any).process = originalProcess;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).fetch;
    }
  });
});

