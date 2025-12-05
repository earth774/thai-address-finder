import { ThaiAddress } from '../types/address';

interface GeographyItem {
  provinceNameTh: string;
  districtNameTh: string;
  subdistrictNameTh: string;
  postalCode: number;
}

const DEFAULT_BASE_URL =
  'https://raw.githubusercontent.com/earth774/thai-address-finder/refs/heads/main/public/data';
const GEOGRAPHY_FILE = 'geography.json';

let cachedAddresses: ThaiAddress[] | null = null;
let loadPromise: Promise<ThaiAddress[]> | null = null;

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

function resolveBaseUrl(override?: string): string {
  const envBase = process.env.THAI_ADDRESS_DATA_URL;
  const selected = override ?? envBase ?? DEFAULT_BASE_URL;
  return normalizeBaseUrl(selected);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/**
 * Asynchronously load and cache Thai addresses from remote JSON.
 * Subsequent calls reuse the cached array.
 */
export async function initAddressData(options?: { baseUrl?: string }): Promise<ThaiAddress[]> {
  if (cachedAddresses) {
    return cachedAddresses;
  }
  if (loadPromise) {
    return loadPromise;
  }

  const baseUrl = resolveBaseUrl(options?.baseUrl);
  const url = `${baseUrl}/${GEOGRAPHY_FILE}`;

  loadPromise = fetchJson<GeographyItem[]>(url)
    .then((geographyData) =>
      geographyData.map((item) => ({
        province: item.provinceNameTh,
        district: item.districtNameTh,
        subDistrict: item.subdistrictNameTh,
        postalCode: String(item.postalCode),
      }))
    )
    .then((mapped) => {
      cachedAddresses = mapped;
      return mapped;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    });

  return loadPromise;
}

/**
 * Retrieve the cached addresses or throw if not initialized.
 * Consumers must call `initAddressData()` during app startup.
 */
export function getAddresses(): ThaiAddress[] {
  if (!cachedAddresses) {
    throw new Error('Address data not loaded. Call initAddressData() before using address APIs.');
  }
  return cachedAddresses;
}
