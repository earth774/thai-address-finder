import {
  validatePostalCode,
  validateAddress,
  isValidProvince,
  isValidDistrict,
  isValidSubDistrict,
} from '../src/validation/validator';
import { ThaiAddress } from '../src/types/address';

describe('Validation Functions', () => {
  describe('validatePostalCode', () => {
    it('should validate correct 5-digit postal code', () => {
      expect(validatePostalCode('10100')).toBe(true);
      expect(validatePostalCode('50000')).toBe(true);
      expect(validatePostalCode('83000')).toBe(true);
    });

    it('should reject invalid postal codes', () => {
      expect(validatePostalCode('1234')).toBe(false); // too short
      expect(validatePostalCode('123456')).toBe(false); // too long
      expect(validatePostalCode('abcde')).toBe(false); // non-numeric
      expect(validatePostalCode('12-34')).toBe(false); // contains dash
    });

    it('should reject null/undefined/empty', () => {
      expect(validatePostalCode('')).toBe(false);
      expect(validatePostalCode('   ')).toBe(false);
      // @ts-expect-error testing invalid input
      expect(validatePostalCode(null)).toBe(false);
      // @ts-expect-error testing invalid input
      expect(validatePostalCode(undefined)).toBe(false);
    });

    it('should trim whitespace before validation', () => {
      expect(validatePostalCode('  10100  ')).toBe(true);
    });
  });

  describe('isValidProvince', () => {
    it('should validate existing provinces', () => {
      expect(isValidProvince('กรุงเทพมหานคร')).toBe(true);
      expect(isValidProvince('เชียงใหม่')).toBe(true);
      expect(isValidProvince('ภูเก็ต')).toBe(true);
    });

    it('should reject non-existent provinces', () => {
      expect(isValidProvince('ไม่มีจังหวัดนี้')).toBe(false);
      expect(isValidProvince('')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidProvince('กรุงเทพมหานคร')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isValidProvince('  กรุงเทพมหานคร  ')).toBe(true);
    });
  });

  describe('isValidDistrict', () => {
    it('should validate existing districts', () => {
      expect(isValidDistrict('ปทุมวัน')).toBe(true);
      expect(isValidDistrict('เมืองเชียงใหม่')).toBe(true);
    });

    it('should validate district within province', () => {
      expect(isValidDistrict('ปทุมวัน', 'กรุงเทพมหานคร')).toBe(true);
      expect(isValidDistrict('ปทุมวัน', 'เชียงใหม่')).toBe(false);
    });

    it('should reject non-existent districts', () => {
      expect(isValidDistrict('ไม่มีอำเภอนี้')).toBe(false);
      expect(isValidDistrict('')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidDistrict('')).toBe(false);
      expect(isValidDistrict('   ')).toBe(false);
    });
  });

  describe('isValidSubDistrict', () => {
    it('should validate existing sub-districts', () => {
      expect(isValidSubDistrict('ปทุมวัน')).toBe(true);
      expect(isValidSubDistrict('ลุมพินี')).toBe(true);
    });

    it('should validate sub-district within district and province', () => {
      expect(isValidSubDistrict('ปทุมวัน', 'ปทุมวัน', 'กรุงเทพมหานคร')).toBe(true);
      expect(isValidSubDistrict('ปทุมวัน', 'ปทุมวัน', 'เชียงใหม่')).toBe(false);
    });

    it('should validate sub-district with only district', () => {
      expect(isValidSubDistrict('ปทุมวัน', 'ปทุมวัน')).toBe(true);
    });

    it('should reject non-existent sub-districts', () => {
      expect(isValidSubDistrict('ไม่มีตำบลนี้')).toBe(false);
      expect(isValidSubDistrict('')).toBe(false);
    });
  });

  describe('validateAddress', () => {
    it('should validate complete correct address', () => {
      const address: ThaiAddress = {
        province: 'กรุงเทพมหานคร',
        district: 'ปทุมวัน',
        subDistrict: 'ปทุมวัน',
        postalCode: '10330',
      };
      expect(validateAddress(address)).toBe(true);
    });

    it('should reject address with missing fields', () => {
      // @ts-expect-error testing invalid input
      expect(validateAddress({})).toBe(false);
      // @ts-expect-error testing invalid input
      expect(validateAddress({ province: 'กรุงเทพมหานคร' })).toBe(false);
    });

    it('should reject address with invalid postal code', () => {
      const address: ThaiAddress = {
        province: 'กรุงเทพมหานคร',
        district: 'ปทุมวัน',
        subDistrict: 'ปทุมวัน',
        postalCode: '1234', // invalid
      };
      expect(validateAddress(address)).toBe(false);
    });

    it('should reject non-existent address', () => {
      const address: ThaiAddress = {
        province: 'ไม่มีจังหวัดนี้',
        district: 'ไม่มีอำเภอนี้',
        subDistrict: 'ไม่มีตำบลนี้',
        postalCode: '99999',
      };
      expect(validateAddress(address)).toBe(false);
    });

    it('should reject null/undefined', () => {
      // @ts-expect-error testing invalid input
      expect(validateAddress(null)).toBe(false);
      // @ts-expect-error testing invalid input
      expect(validateAddress(undefined)).toBe(false);
    });

    it('should validate address with correct combination', () => {
      const address: ThaiAddress = {
        province: 'เชียงใหม่',
        district: 'เมืองเชียงใหม่',
        subDistrict: 'ศรีภูมิ',
        postalCode: '50200',
      };
      expect(validateAddress(address)).toBe(true);
    });
  });
});
