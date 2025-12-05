# thai-address-finder

A TypeScript library to search and find Thai address information including provinces, districts, sub-districts, and postal codes.

## Features

- 🔍 **Search** - Search addresses by province, district, sub-district, or postal code
- 🔎 **Autocomplete** - Get address suggestions with relevance scoring
- ✅ **Validation** - Validate postal codes and complete addresses
- 📋 **Utilities** - Get lists of provinces, districts, and sub-districts
- 🇹🇭 **Thai Language Support** - Full support for Thai text search and matching

## Installation

```bash
npm install thai-address-finder
```

## Usage

> Important: The package no longer bundles JSON data. You must initialize once
> (and have network access) so the library can fetch data from GitHub or your
> own URL.

### Initialize data (required)

```typescript
import { initAddressData } from 'thai-address-finder';

// Call once during app startup
await initAddressData({
  // Optional: override base URL (default pulls from GitHub raw)
  // baseUrl: 'https://raw.githubusercontent.com/earth774/thai-address-finder/refs/heads/main/public/data'
});
```

You can also set an environment variable instead of passing `baseUrl`:

- `THAI_ADDRESS_DATA_URL=https://your-domain/thai-address-data`

After initialization, all search/autocomplete/validation helpers are synchronous
as before.

### Basic Search

```typescript
import { initAddressData, searchAddresses, findByPostalCode } from 'thai-address-finder';

await initAddressData();

// Search by postal code
const addresses = findByPostalCode('10100');
console.log(addresses);
// [
//   {
//     province: 'กรุงเทพมหานคร',
//     district: 'ปทุมวัน',
//     subDistrict: 'ปทุมวัน',
//     postalCode: '10100'
//   }
// ]

// Search with multiple criteria
const results = searchAddresses({
  province: 'กรุงเทพมหานคร',
  district: 'ปทุมวัน'
});
```

### Autocomplete

```typescript
import { initAddressData, autocomplete } from 'thai-address-finder';

await initAddressData();

// Get address suggestions
const suggestions = autocomplete({
  query: 'กรุงเทพ',
  limit: 5
});

// Results are sorted by relevance score
console.log(suggestions);
```

### Validation

```typescript
import {
  initAddressData,
  validatePostalCode,
  validateAddress,
  isValidProvince,
  isValidDistrict
} from 'thai-address-finder';

await initAddressData();

// Validate postal code format
validatePostalCode('10100'); // true
validatePostalCode('1234');  // false

// Validate complete address
const address = {
  province: 'กรุงเทพมหานคร',
  district: 'ปทุมวัน',
  subDistrict: 'ปทุมวัน',
  postalCode: '10100'
};
validateAddress(address); // true

// Check if province exists
isValidProvince('กรุงเทพมหานคร'); // true
isValidProvince('ไม่มีจังหวัดนี้'); // false

// Check if district exists (optionally within province)
isValidDistrict('ปทุมวัน', 'กรุงเทพมหานคร'); // true
```

### Utility Functions

```typescript
import {
  initAddressData,
  getProvinces,
  getDistricts,
  getSubDistricts
} from 'thai-address-finder';

await initAddressData();

// Get all provinces
const provinces = getProvinces();
console.log(provinces);
// ['กรุงเทพมหานคร', 'เชียงใหม่', 'ภูเก็ต', ...]

// Get districts by province
const districts = getDistricts('กรุงเทพมหานคร');
console.log(districts);
// ['ปทุมวัน', 'สาทร', 'คลองสาน', ...]

// Get sub-districts by district and province
const subDistricts = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
console.log(subDistricts);
// ['ปทุมวัน', 'ลุมพินี']
```

## API Reference

### Types

#### `ThaiAddress`

```typescript
interface ThaiAddress {
  province: string;
  district: string;
  subDistrict: string;
  postalCode: string;
}
```

#### `SearchOptions`

```typescript
interface SearchOptions {
  province?: string;
  district?: string;
  subDistrict?: string;
  postalCode?: string;
}
```

#### `AutocompleteOptions`

```typescript
interface AutocompleteOptions {
  query: string;
  limit?: number; // Default: 10
}
```

### Search Functions

> All functions require `initAddressData()` to be called once beforehand.

#### `searchAddresses(options: SearchOptions): ThaiAddress[]`

Search addresses by multiple criteria. All criteria are optional and combined with AND logic.

```typescript
searchAddresses({
  province: 'กรุงเทพมหานคร',
  district: 'ปทุมวัน'
});
```

#### `findByPostalCode(postalCode: string): ThaiAddress[]`

Find all addresses with a specific postal code.

```typescript
findByPostalCode('10100');
```

#### `findByProvince(province: string): ThaiAddress[]`

Find all addresses in a province. Supports partial matching.

```typescript
findByProvince('กรุงเทพมหานคร');
```

#### `findByDistrict(district: string, province?: string): ThaiAddress[]`

Find all addresses in a district. Optionally filter by province.

```typescript
findByDistrict('ปทุมวัน');
findByDistrict('ปทุมวัน', 'กรุงเทพมหานคร');
```

### Autocomplete

#### `autocomplete(options: AutocompleteOptions): ThaiAddress[]`

Get address suggestions based on query string. Results are sorted by relevance score.

```typescript
autocomplete({ query: 'กรุงเทพ', limit: 10 });
```

### Validation Functions

#### `validatePostalCode(code: string): boolean`

Validate postal code format (5 digits).

```typescript
validatePostalCode('10100'); // true
validatePostalCode('1234');  // false
```

#### `validateAddress(address: ThaiAddress): boolean`

Validate a complete address object. Checks format and existence in database.

```typescript
validateAddress({
  province: 'กรุงเทพมหานคร',
  district: 'ปทุมวัน',
  subDistrict: 'ปทุมวัน',
  postalCode: '10100'
}); // true
```

#### `isValidProvince(province: string): boolean`

Check if a province exists in the database.

```typescript
isValidProvince('กรุงเทพมหานคร'); // true
```

#### `isValidDistrict(district: string, province?: string): boolean`

Check if a district exists. Optionally validate within a specific province.

```typescript
isValidDistrict('ปทุมวัน', 'กรุงเทพมหานคร'); // true
```

#### `isValidSubDistrict(subDistrict: string, district?: string, province?: string): boolean`

Check if a sub-district exists. Optionally validate within district and province.

```typescript
isValidSubDistrict('ปทุมวัน', 'ปทุมวัน', 'กรุงเทพมหานคร'); // true
```

### Utility Functions

#### `getProvinces(): string[]`

Get unique list of all provinces, sorted alphabetically.

```typescript
const provinces = getProvinces();
```

#### `getDistricts(province: string): string[]`

Get unique list of districts in a province, sorted alphabetically.

```typescript
const districts = getDistricts('กรุงเทพมหานคร');
```

#### `getSubDistricts(district: string, province: string): string[]`

Get unique list of sub-districts in a district and province, sorted alphabetically.

```typescript
const subDistricts = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
```

#### `normalizeThaiText(text: string): string`

Normalize Thai text for search comparison (removes spaces, converts to lowercase).

```typescript
normalizeThaiText('  กรุงเทพมหานคร  '); // 'กรุงเทพมหานคร'
```

## Development

### Prerequisites

- Node.js >= 16
- npm >= 8

### Setup

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Project Structure

```
thai-address-finder/
├── src/
│   ├── index.ts           # Main export file
│   ├── types/
│   │   └── address.ts     # TypeScript interfaces
│   ├── data/
│   │   └── addresses.ts   # Address data
│   ├── search/
│   │   ├── search.ts      # Search functions
│   │   └── autocomplete.ts # Autocomplete logic
│   ├── validation/
│   │   └── validator.ts   # Validation functions
│   └── utils/
│       └── helpers.ts     # Utility functions
├── tests/                 # Unit tests
└── dist/                  # Compiled output
```

## Data Source

- Default: downloads from GitHub raw data set at
  `https://raw.githubusercontent.com/earth774/thai-address-finder/refs/heads/main/public/data/geography.json`
  (you can override via `THAI_ADDRESS_DATA_URL` or `initAddressData({ baseUrl })`).
- For production, consider hosting the JSON yourself (e.g., on your CDN/object
  storage) to avoid GitHub rate limits and to pin an exact version.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Run `npm run lint` and `npm run format` before committing
- Write tests for new features
- Maintain test coverage above 80%

## License

MIT

## Author

Free and open source library for the Thai developer community.

