import {COLOR_RANGES, ColorRange} from '@kepler.gl/constants';
import {HexColor} from '@kepler.gl/types';
import colorbrewer from 'colorbrewer';
import interpolate from 'color-interpolate';

export const MAX_COLOR_RANGE_LENGTH = 20;

export function getDefaultColorRange(numberOfColors: number): ColorRange {
  const foundColorRange = ALL_COLOR_RANGES.find(colorRange => {
    return (
      colorRange.colors.length ===
      (numberOfColors > MAX_COLOR_RANGE_LENGTH ? MAX_COLOR_RANGE_LENGTH : numberOfColors)
    );
  });
  // return the first color range if not found
  return foundColorRange ?? ALL_COLOR_RANGES[0];
}

export function findColorRange(newStep: number, oldColorRange?: ColorRange) {
  const newColorRange = ALL_COLOR_RANGES.find(
    colorRange =>
      colorRange.colors.length === newStep &&
      colorRange.type === oldColorRange?.type &&
      colorRange.category === oldColorRange?.category &&
      // compare the name before -[number] part
      colorRange.name?.split('-')[0] === oldColorRange?.name?.split('-')[0]
  );
  return newColorRange ?? getDefaultColorRange(newStep);
}

// @ts-ignore - colorbrewer is not typed
const colorBrewerMap: {[key: string]; string} = Object.entries(colorbrewer.schemeGroups).reduce(
  (accu, [type, palettes]: [string, any]) => ({
    ...accu,
    ...palettes.reduce(
      // @ts-ignore - colorbrewer is not typed
      (group, name) => ({
        ...group,
        [name]: type
      }),
      {}
    )
  }),
  {}
);

// convert HexColor string to rgb array
export function hexToRgb(hex: string): number[] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
}

export function updateColorRanges(): ColorRange[] {
  // update the COLOR_RANGES array by adding missing color ranges with length of colors that are not in the array
  const colorRanges = COLOR_RANGES;
  const missingColorStartIndex = 12; // colorbrewer schemes have at most 12 colors
  for (let i = missingColorStartIndex; i <= MAX_COLOR_RANGE_LENGTH; i++) {
    for (const [keyName, colorScheme] of Object.entries(colorbrewer)) {
      if (keyName !== 'schemeGroups') {
        const originalColors = colorScheme[8]; // all colorbrewer schemes have at least 8 colors
        const interp = interpolate(originalColors);
        const colors = Array.from({length: i}, (_, j) => interp(j / (i - 1)));
        // convert colors from 'rgb(255, 255, 255)' to '#ffffff'
        const hexColors = colors.map(color => {
          const rgb = color.match(/\d+/g);
          return `#${rgb?.map(c => parseInt(c).toString(16).padStart(2, '0')).join('')}`;
        });
        // check if the color range already exists
        const existingColorRange = colorRanges.find(colorRange => {
          return colorRange.name === `ColorBrewer ${keyName}-${i}`;
        });
        if (!existingColorRange) {
          colorRanges.push({
            name: `ColorBrewer ${keyName}-${i}`,
            type: colorBrewerMap[keyName],
            category: 'ColorBrewer',
            colors: hexColors as HexColor[]
          });
        }
      }
    }
  }
  return colorRanges;
}

export const ALL_COLOR_RANGES = updateColorRanges();

// export unique color types from ALL_COLOR_RANGES
export const UNIQUE_COLOR_TYPES = Array.from(
  new Set(ALL_COLOR_RANGES.map(colorRange => colorRange.type))
);

// export get color ranges by number of colors and color type
export function getColorRanges(numberOfColors: number, colorType: string): ColorRange[] {
  const clampedColors =
    numberOfColors > MAX_COLOR_RANGE_LENGTH ? MAX_COLOR_RANGE_LENGTH : numberOfColors;
  return ALL_COLOR_RANGES.filter(colorRange => {
    return (
      colorRange.colors.length === clampedColors &&
      // filter by color type if provided
      (colorType && colorType !== '' && colorType !== 'all' ? colorRange.type === colorType : true)
    );
  });
}
