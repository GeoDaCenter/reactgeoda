import {COLOR_RANGES, ColorRange} from '@kepler.gl/constants';
import {HexColor} from '@kepler.gl/types';
import colorbrewer from 'colorbrewer';
import interpolate from 'color-interpolate';

const MAX_COLOR_RANGE_LENGTH = 20;

export function getDefaultColorRange(numberOfColors: number) {
  return ALL_COLOR_RANGES.find(colorRange => {
    return (
      colorRange.colors.length ===
      (numberOfColors > MAX_COLOR_RANGE_LENGTH ? MAX_COLOR_RANGE_LENGTH : numberOfColors)
    );
  });
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
  const missingColorStartIndex = 13; // colorbrewer schemes have at most 12 colors
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
        colorRanges.push({
          name: `ColorBrewer ${keyName}-${i}`,
          type: colorBrewerMap[keyName],
          category: 'ColorBrewer',
          colors: hexColors as HexColor[]
        });
      }
    }
  }
  return colorRanges;
}

export const ALL_COLOR_RANGES = updateColorRanges();
