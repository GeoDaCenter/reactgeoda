import {
  getDefaultColorRange,
  findColorRange,
  hexToRgb,
  updateColorRanges,
  ALL_COLOR_RANGES
} from '@/utils/color-utils';
import {ColorRange} from '@kepler.gl/constants';

describe('color-utils', () => {
  describe('ALL_COLOR_RANGES', () => {
    test('is populated with color ranges', () => {
      expect(Array.isArray(ALL_COLOR_RANGES)).toBe(true);
      expect(ALL_COLOR_RANGES.length).toBeGreaterThan(0);
    });

    test('each range has required properties', () => {
      ALL_COLOR_RANGES.forEach(range => {
        expect(range).toHaveProperty('name');
        expect(range).toHaveProperty('colors');
        expect(range).toHaveProperty('type');
        expect(range).toHaveProperty('category');
        expect(Array.isArray(range.colors)).toBe(true);
      });
    });
  });

  describe('updateColorRanges', () => {
    test('returns array of color ranges', () => {
      const ranges = updateColorRanges();
      expect(Array.isArray(ranges)).toBe(true);
      expect(ranges.length).toBeGreaterThan(0);
    });

    test('generates correct number of colors for each range', () => {
      const ranges = updateColorRanges();
      ranges.forEach(range => {
        expect(range.colors.length).toBeLessThanOrEqual(20); // MAX_COLOR_RANGE_LENGTH
        expect(range.colors.length).toBeGreaterThan(0);
      });
    });

    test('generates valid hex colors', () => {
      const ranges = updateColorRanges();
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

      ranges.forEach(range => {
        range.colors.forEach(color => {
          expect(color).toMatch(hexColorRegex);
        });
      });
    });
  });

  describe('getDefaultColorRange', () => {
    test('returns correct color range for given number of colors', () => {
      const result = getDefaultColorRange(5);
      expect(result.colors).toHaveLength(5);
    });

    test('returns max length color range when number exceeds MAX_COLOR_RANGE_LENGTH', () => {
      const result = getDefaultColorRange(25);
      expect(result.colors.length).toBeLessThanOrEqual(20); // MAX_COLOR_RANGE_LENGTH is 20
    });
  });

  describe('findColorRange', () => {
    const mockColorRange: ColorRange = {
      name: 'Test-8',
      type: 'sequential',
      category: 'Test',
      colors: Array(8).fill('#000000')
    };

    test.skip('finds matching color range with same properties', () => {
      const result = findColorRange(8, mockColorRange);
      expect(result.type).toBe(mockColorRange.type);
      expect(result.category).toBe(mockColorRange.category);
      expect(result.name?.split('-')[0]).toBe(mockColorRange.name?.split('-')[0]);
    });

    test('returns default color range when no match found', () => {
      const result = findColorRange(3, mockColorRange);
      expect(result).toEqual(getDefaultColorRange(3));
    });
  });

  describe('hexToRgb', () => {
    test('converts hex color to RGB array', () => {
      expect(hexToRgb('#ff0000')).toEqual([255, 0, 0]);
      expect(hexToRgb('#00ff00')).toEqual([0, 255, 0]);
      expect(hexToRgb('#0000ff')).toEqual([0, 0, 255]);
      expect(hexToRgb('#ffffff')).toEqual([255, 255, 255]);
    });
  });
});
