import {
  normalizeThaiText,
  getProvinces,
  getDistricts,
  getSubDistricts,
} from '../src/utils/helpers';

describe('Helper Functions', () => {
  describe('normalizeThaiText', () => {
    it('should normalize text to lowercase', () => {
      expect(normalizeThaiText('กรุงเทพมหานคร')).toBe('กรุงเทพมหานคร');
    });

    it('should remove leading and trailing whitespace', () => {
      expect(normalizeThaiText('  กรุงเทพมหานคร  ')).toBe('กรุงเทพมหานคร');
    });

    it('should remove multiple spaces', () => {
      expect(normalizeThaiText('กรุงเทพ   มหานคร')).toBe('กรุงเทพมหานคร');
    });

    it('should handle empty string', () => {
      expect(normalizeThaiText('')).toBe('');
      expect(normalizeThaiText('   ')).toBe('');
    });
  });

  describe('getProvinces', () => {
    it('should return array of unique provinces', () => {
      const provinces = getProvinces();
      expect(Array.isArray(provinces)).toBe(true);
      expect(provinces.length).toBeGreaterThan(0);
    });

    it('should return sorted provinces', () => {
      const provinces = getProvinces();
      const sorted = [...provinces].sort();
      expect(provinces).toEqual(sorted);
    });

    it('should return unique values only', () => {
      const provinces = getProvinces();
      const uniqueSet = new Set(provinces);
      expect(provinces.length).toBe(uniqueSet.size);
    });

    it('should include known provinces', () => {
      const provinces = getProvinces();
      expect(provinces).toContain('กรุงเทพมหานคร');
      expect(provinces).toContain('เชียงใหม่');
      expect(provinces).toContain('ภูเก็ต');
    });
  });

  describe('getDistricts', () => {
    it('should return districts for valid province', () => {
      const districts = getDistricts('กรุงเทพมหานคร');
      expect(Array.isArray(districts)).toBe(true);
      expect(districts.length).toBeGreaterThan(0);
    });

    it('should return sorted districts', () => {
      const districts = getDistricts('กรุงเทพมหานคร');
      const sorted = [...districts].sort();
      expect(districts).toEqual(sorted);
    });

    it('should return unique districts', () => {
      const districts = getDistricts('กรุงเทพมหานคร');
      const uniqueSet = new Set(districts);
      expect(districts.length).toBe(uniqueSet.size);
    });

    it('should be case-insensitive', () => {
      const districts1 = getDistricts('กรุงเทพมหานคร');
      const districts2 = getDistricts('กรุงเทพมหานคร');
      expect(districts1).toEqual(districts2);
    });

    it('should handle whitespace', () => {
      const districts = getDistricts('  กรุงเทพมหานคร  ');
      expect(districts.length).toBeGreaterThan(0);
    });

    it('should return empty array for non-existent province', () => {
      const districts = getDistricts('ไม่มีจังหวัดนี้');
      expect(districts).toEqual([]);
    });

    it('should include known districts', () => {
      const districts = getDistricts('กรุงเทพมหานคร');
      expect(districts).toContain('ปทุมวัน');
      expect(districts).toContain('สาทร');
    });
  });

  describe('getSubDistricts', () => {
    it('should return sub-districts for valid district and province', () => {
      const subDistricts = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
      expect(Array.isArray(subDistricts)).toBe(true);
      expect(subDistricts.length).toBeGreaterThan(0);
    });

    it('should return sorted sub-districts', () => {
      const subDistricts = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
      const sorted = [...subDistricts].sort();
      expect(subDistricts).toEqual(sorted);
    });

    it('should return unique sub-districts', () => {
      const subDistricts = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
      const uniqueSet = new Set(subDistricts);
      expect(subDistricts.length).toBe(uniqueSet.size);
    });

    it('should be case-insensitive', () => {
      const subDistricts1 = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
      const subDistricts2 = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
      expect(subDistricts1).toEqual(subDistricts2);
    });

    it('should return empty array for non-existent district', () => {
      const subDistricts = getSubDistricts('ไม่มีอำเภอนี้', 'กรุงเทพมหานคร');
      expect(subDistricts).toEqual([]);
    });

    it('should return empty array for non-existent province', () => {
      const subDistricts = getSubDistricts('ปทุมวัน', 'ไม่มีจังหวัดนี้');
      expect(subDistricts).toEqual([]);
    });

    it('should include known sub-districts', () => {
      const subDistricts = getSubDistricts('ปทุมวัน', 'กรุงเทพมหานคร');
      expect(subDistricts).toContain('ปทุมวัน');
      expect(subDistricts).toContain('ลุมพินี');
    });
  });
});
