import React from 'react';
import {Select, SelectItem} from '@nextui-org/react';
import {COLOR_RANGES, ColorRange} from '@kepler.gl/constants';
import {ColorPalette} from '@kepler.gl/components';

type ColorSelectorProps = {
  numberOfColors?: number;
  defaultColorRange?: string;
  onSelectColorRange: (colorRange: ColorRange) => void;
};

export function getDefaultColorRange(numberOfColors: number) {
  return COLOR_RANGES.find(colorRange => {
    return colorRange.colors.length === numberOfColors;
  });
}

export function ColorSelector({
  numberOfColors = 5,
  defaultColorRange,
  onSelectColorRange
}: ColorSelectorProps) {
  const colorRanges = COLOR_RANGES.filter(colorRange => {
    return colorRange.colors.length === numberOfColors;
  });

  const selectedColorRange =
    colorRanges.find(colorRange => colorRange.name === defaultColorRange) || colorRanges[0];

  return (
    <Select
      label="Select color scheme"
      className="max-w"
      items={colorRanges}
      renderValue={items => {
        return items.map(item => (
          <ColorPalette
            key={item.data?.name}
            colors={item.data?.colors || []}
            isReversed={false}
            isSelected={item.data?.name === selectedColorRange.name}
          />
        ));
      }}
      defaultSelectedKeys={[`${selectedColorRange.name}`]}
    >
      {colorRange => (
        <SelectItem
          key={`${colorRange.name}`}
          onClick={() => onSelectColorRange(colorRange)}
          className="gap-0 py-0"
        >
          <ColorPalette
            colors={colorRange.colors}
            isReversed={false}
            isSelected={colorRange.name === selectedColorRange.name}
          />
        </SelectItem>
      )}
    </Select>
  );
}
