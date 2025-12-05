import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ThaiAddress } from '../types/address';

interface GeographyItem {
  provinceNameTh: string;
  districtNameTh: string;
  subdistrictNameTh: string;
  postalCode: number;
}

let cachedAddresses: ThaiAddress[] | null = null;
let loadPromise: Promise<ThaiAddress[]> | null = null;

const GEOGRAPHY_FILE = 'geography.json';
const DEFAULT_BASE_URL = (() => {
  try {
    // Use bundler-resolved asset URL when available to avoid remote fetch defaults
    const metaUrl = new Function(
      'return typeof import.meta !== "undefined" ? import.meta.url : undefined;'
    )() as string | undefined;
    if (metaUrl) {
      const geographyAssetUrl = new URL(`../data/${GEOGRAPHY_FILE}`, metaUrl).toString();
      return geographyAssetUrl.replace(new RegExp(`/${GEOGRAPHY_FILE}$`), '');
    }
  } catch {
    // ignore and fall through to default
  }
  // Fallback for environments without import.meta replacement; expect caller to host /data/*
  return '/data';
})();

function mapGeographyToAddresses(geographyData: GeographyItem[]): ThaiAddress[] {
  return geographyData.map((item) => ({
    province: item.provinceNameTh,
    district: item.districtNameTh,
    subDistrict: item.subdistrictNameTh,
    postalCode: String(item.postalCode),
  }));
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function resolveBaseUrl(override?: string): string {
  const envBase =
    typeof process !== 'undefined' && process.env ? process.env.THAI_ADDRESS_DATA_URL : undefined;
  const selected = override ?? envBase ?? DEFAULT_BASE_URL;
  return normalizeBaseUrl(selected);
}

function isNodeEnv(): boolean {
  return typeof process !== 'undefined' && !!process?.versions?.node;
}

function resolveBaseDir(): string {
  // __dirname exists in CJS (ts-jest) and fallback for ESM using import.meta.url
  if (typeof __dirname !== 'undefined') {
    return __dirname;
  }

  // Avoid direct `import.meta` access to keep ts-jest (CJS) happy
  const importMetaUrl = (() => {
    try {
      // eslint-disable-next-line no-new-func
      return new Function(
        'return typeof import.meta !== "undefined" ? import.meta.url : undefined;'
      )() as string | undefined;
    } catch (err) {
      return undefined;
    }
  })();

  if (typeof importMetaUrl === 'string') {
    const filePath = fileURLToPath(importMetaUrl);
    return path.dirname(filePath);
  }

  // Last resort: current working directory (Node) or empty string (browser)
  return isNodeEnv() && typeof process.cwd === 'function' ? process.cwd() : '';
}

function resolveGeographyPath(): string {
  if (!isNodeEnv()) {
    throw new Error(
      'Local geography data loading is supported only in Node. For browser use, import the package build that fetches remote data or supply THAI_ADDRESS_DATA_URL.'
    );
  }

  const baseDir = resolveBaseDir();
  const candidates = [
    path.join(baseDir, GEOGRAPHY_FILE),
    path.join(baseDir, 'geography.min.json'),
    path.join(baseDir, '..', 'data', GEOGRAPHY_FILE),
    path.join(baseDir, '..', '..', 'public', 'data', GEOGRAPHY_FILE),
    path.join(baseDir, '..', '..', 'dist', 'data', GEOGRAPHY_FILE),
    path.join(process.cwd(), 'public', 'data', GEOGRAPHY_FILE),
    path.join(process.cwd(), 'dist', 'data', GEOGRAPHY_FILE),
    path.join(process.cwd(), 'src', 'data', GEOGRAPHY_FILE),
  ];

  const seen = new Set<string>();
  for (const candidate of candidates) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    'Geography data file not found. Run `npm run build:data` to generate minified assets.'
  );
}

function readGeography(): GeographyItem[] {
  const geographyPath = resolveGeographyPath();
  const raw = fs.readFileSync(geographyPath, 'utf8');
  return JSON.parse(raw) as GeographyItem[];
}

/**
 * Load and cache Thai addresses from the minified geography data.
 * This runs once per process and reuses the cached array afterwards.
 */
export function loadAddresses(): ThaiAddress[] {
  if (cachedAddresses) {
    return cachedAddresses;
  }

  if (!isNodeEnv()) {
    throw new Error(
      'Address data not loaded. In browser environments, call initAddressData() with a remote data URL.'
    );
  }

  const geographyData = readGeography();
  cachedAddresses = (geographyData as GeographyItem[]).map((item) => ({
    province: item.provinceNameTh,
    district: item.districtNameTh,
    subDistrict: item.subdistrictNameTh,
    postalCode: String(item.postalCode),
  }));

  return cachedAddresses;
}

/**
 * Ensure data is loaded and return the cached array.
 * This keeps a synchronous API for Node/Jest consumers.
 */
export function getAddresses(): ThaiAddress[] {
  if (!cachedAddresses) {
    if (isNodeEnv()) {
      loadAddresses();
    } else {
      // Kick off async load with default/baseUrl if not already started
      if (!loadPromise) {
        void initAddressData().catch(() => {
          // swallow here; errors are surfaced when awaiting initAddressData
        });
      }
      return [];
    }
  }
  return cachedAddresses as ThaiAddress[];
}

/**
 * Async-friendly initializer to align with the public API surface.
 * For the in-repo build we load synchronously from disk.
 */
export async function initAddressData(options?: { baseUrl?: string }): Promise<ThaiAddress[]> {
  if (cachedAddresses) {
    return cachedAddresses;
  }

  if (loadPromise) {
    return loadPromise;
  }

  if (isNodeEnv()) {
    return loadAddresses();
  }

  const fetchFn = (globalThis as { fetch?: typeof fetch }).fetch;

  if (!fetchFn) {
    throw new Error('Global fetch is not available. Provide a fetch polyfill in this environment.');
  }

  const baseUrl = resolveBaseUrl(options?.baseUrl);
  const url = `${baseUrl}/${GEOGRAPHY_FILE}`;

  loadPromise = fetchFn(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }
      return response.json() as Promise<GeographyItem[]>;
    })
    .then((geographyData) => {
      cachedAddresses = mapGeographyToAddresses(geographyData as GeographyItem[]);
      return cachedAddresses;
    })
    .finally(() => {
      loadPromise = null;
    });

  return loadPromise;
}

// Eagerly load once on module import so consumers retain a synchronous API.
export const addresses: ThaiAddress[] = isNodeEnv() ? loadAddresses() : (cachedAddresses ?? []);
