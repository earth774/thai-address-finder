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

const geographyFileName = 'geography.json';

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
    path.join(baseDir, geographyFileName),
    path.join(baseDir, 'geography.min.json'),
    path.join(baseDir, '..', 'data', geographyFileName),
    path.join(baseDir, '..', '..', 'public', 'data', geographyFileName),
    path.join(baseDir, '..', '..', 'dist', 'data', geographyFileName),
    path.join(process.cwd(), 'public', 'data', geographyFileName),
    path.join(process.cwd(), 'dist', 'data', geographyFileName),
    path.join(process.cwd(), 'src', 'data', geographyFileName),
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
    loadAddresses();
  }
  return cachedAddresses as ThaiAddress[];
}

/**
 * Async-friendly initializer to align with the public API surface.
 * For the in-repo build we load synchronously from disk.
 */
export async function initAddressData(): Promise<ThaiAddress[]> {
  return loadAddresses();
}

// Eagerly load once on module import so consumers retain a synchronous API.
export const addresses: ThaiAddress[] = loadAddresses();

