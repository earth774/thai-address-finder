import { addresses } from '../data/addresses';

/**
 * Normalize Thai text for search comparison
 * Removes spaces and converts to lowercase
 */
export function normalizeThaiText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Get unique list of all provinces
 */
export function getProvinces(): string[] {
  const provinceSet = new Set<string>();
  addresses.forEach((address) => {
    provinceSet.add(address.province);
  });
  return Array.from(provinceSet).sort();
}

/**
 * Get districts by province
 */
export function getDistricts(province: string): string[] {
  const normalizedProvince = normalizeThaiText(province);
  const districtSet = new Set<string>();
  addresses.forEach((address) => {
    if (normalizeThaiText(address.province) === normalizedProvince) {
      districtSet.add(address.district);
    }
  });
  return Array.from(districtSet).sort();
}

/**
 * Get sub-districts by district and province
 */
export function getSubDistricts(district: string, province: string): string[] {
  const normalizedDistrict = normalizeThaiText(district);
  const normalizedProvince = normalizeThaiText(province);
  const subDistrictSet = new Set<string>();
  addresses.forEach((address) => {
    if (
      normalizeThaiText(address.district) === normalizedDistrict &&
      normalizeThaiText(address.province) === normalizedProvince
    ) {
      subDistrictSet.add(address.subDistrict);
    }
  });
  return Array.from(subDistrictSet).sort();
}
