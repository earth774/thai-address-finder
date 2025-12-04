// Export types
export type { ThaiAddress, SearchOptions, AutocompleteOptions } from './types/address';

// Export search functions
export { searchAddresses, findByPostalCode, findByProvince, findByDistrict } from './search/search';

// Export autocomplete function
export { autocomplete } from './search/autocomplete';

// Export validation functions
export {
  validatePostalCode,
  validateAddress,
  isValidProvince,
  isValidDistrict,
  isValidSubDistrict,
} from './validation/validator';

// Export utility functions
export { getProvinces, getDistricts, getSubDistricts, normalizeThaiText } from './utils/helpers';
