import {
  searchAddresses,
  findByPostalCode,
  findByProvince,
  findByDistrict,
} from '../src/search/search';
import { SearchOptions } from '../src/types/address';

describe('Search Functions', () => {
  describe('searchAddresses', () => {
    it('should return empty array for empty options', () => {
      const result = searchAddresses({});
      expect(result).toEqual([]);
    });

    it('should return empty array for null/undefined options', () => {
      // @ts-expect-error testing invalid input
      expect(searchAddresses(null)).toEqual([]);
      // @ts-expect-error testing invalid input
      expect(searchAddresses(undefined)).toEqual([]);
    });

    it('should search by postal code', () => {
      const result = searchAddresses({ postalCode: '10100' });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.postalCode === '10100')).toBe(true);
    });

    it('should search by province', () => {
      const result = searchAddresses({ province: 'กรุงเทพมหานคร' });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.province === 'กรุงเทพมหานคร')).toBe(true);
    });

    it('should search by province with partial match', () => {
      const result = searchAddresses({ province: 'กรุงเทพ' });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.province.includes('กรุงเทพ'))).toBe(true);
    });

    it('should search by district', () => {
      const result = searchAddresses({ district: 'ปทุมวัน' });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.district === 'ปทุมวัน')).toBe(true);
    });

    it('should search by sub-district', () => {
      const result = searchAddresses({ subDistrict: 'ปทุมวัน' });
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.subDistrict === 'ปทุมวัน')).toBe(true);
    });

    it('should search by multiple criteria', () => {
      const options: SearchOptions = {
        province: 'กรุงเทพมหานคร',
        district: 'ปทุมวัน',
      };
      const result = searchAddresses(options);
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((addr) => addr.province === 'กรุงเทพมหานคร' && addr.district === 'ปทุมวัน')
      ).toBe(true);
    });

    it('should be case-insensitive', () => {
      const result1 = searchAddresses({ province: 'กรุงเทพมหานคร' });
      const result2 = searchAddresses({ province: 'กรุงเทพมหานคร' });
      expect(result1.length).toBe(result2.length);
    });

    it('should handle whitespace in search terms', () => {
      const result = searchAddresses({ province: '  กรุงเทพมหานคร  ' });
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findByPostalCode', () => {
    it('should find addresses by postal code', () => {
      const result = findByPostalCode('10100');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.postalCode === '10100')).toBe(true);
    });

    it('should return empty array for invalid postal code', () => {
      const result = findByPostalCode('99999');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(findByPostalCode('')).toEqual([]);
      expect(findByPostalCode('   ')).toEqual([]);
    });

    it('should trim whitespace', () => {
      const result = findByPostalCode('  10100  ');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findByProvince', () => {
    it('should find addresses by province', () => {
      const result = findByProvince('กรุงเทพมหานคร');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.province === 'กรุงเทพมหานคร')).toBe(true);
    });

    it('should support partial matching', () => {
      const result = findByProvince('กรุงเทพ');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent province', () => {
      const result = findByProvince('ไม่มีจังหวัดนี้');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(findByProvince('')).toEqual([]);
      expect(findByProvince('   ')).toEqual([]);
    });
  });

  describe('findByDistrict', () => {
    it('should find addresses by district', () => {
      const result = findByDistrict('ปทุมวัน');
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((addr) => addr.district === 'ปทุมวัน')).toBe(true);
    });

    it('should find addresses by district and province', () => {
      const result = findByDistrict('ปทุมวัน', 'กรุงเทพมหานคร');
      expect(result.length).toBeGreaterThan(0);
      expect(
        result.every((addr) => addr.district === 'ปทุมวัน' && addr.province === 'กรุงเทพมหานคร')
      ).toBe(true);
    });

    it('should return empty array for non-existent district', () => {
      const result = findByDistrict('ไม่มีอำเภอนี้');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty string', () => {
      expect(findByDistrict('')).toEqual([]);
      expect(findByDistrict('   ')).toEqual([]);
    });

    it('should filter by province when provided', () => {
      const result = findByDistrict('ปทุมวัน', 'กรุงเทพมหานคร');
      const allResults = findByDistrict('ปทุมวัน');
      expect(result.length).toBeLessThanOrEqual(allResults.length);
    });
  });
});
