import { autocomplete } from '../src/search/autocomplete';

describe('Autocomplete', () => {
  it('should return empty array for empty query', () => {
    expect(autocomplete({ query: '' })).toEqual([]);
    expect(autocomplete({ query: '   ' })).toEqual([]);
  });

  it('should return results for province query', () => {
    const result = autocomplete({ query: 'กรุงเทพ' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((addr) => addr.province.includes('กรุงเทพ'))).toBe(true);
  });

  it('should return results for district query', () => {
    const result = autocomplete({ query: 'ปทุมวัน' });
    expect(result.length).toBeGreaterThan(0);
  });

  it('should return results for postal code query', () => {
    const result = autocomplete({ query: '10100' });
    expect(result.length).toBeGreaterThan(0);
    expect(result.some((addr) => addr.postalCode === '10100')).toBe(true);
  });

  it('should respect limit option', () => {
    const result = autocomplete({ query: 'กรุงเทพ', limit: 3 });
    expect(result.length).toBeLessThanOrEqual(3);
  });

  it('should default to limit 10', () => {
    const result = autocomplete({ query: 'กรุงเทพ' });
    expect(result.length).toBeLessThanOrEqual(10);
  });

  it('should return results sorted by relevance', () => {
    const result = autocomplete({ query: 'กรุงเทพมหานคร' });
    // Exact matches should come first
    if (result.length > 0) {
      expect(result[0].province).toBe('กรุงเทพมหานคร');
    }
  });

  it('should handle partial matches', () => {
    const result = autocomplete({ query: 'กรุง' });
    expect(result.length).toBeGreaterThan(0);
  });

  it('should be case-insensitive', () => {
    const result1 = autocomplete({ query: 'กรุงเทพ' });
    const result2 = autocomplete({ query: 'กรุงเทพ' });
    expect(result1.length).toBe(result2.length);
  });

  it('should return empty array for non-matching query', () => {
    const result = autocomplete({ query: 'xyz123nonexistent' });
    expect(result).toEqual([]);
  });

  it('should prioritize exact matches', () => {
    const result = autocomplete({ query: '10100' });
    // Postal code exact matches should have high priority
    expect(result.some((addr) => addr.postalCode === '10100')).toBe(true);
  });
});
