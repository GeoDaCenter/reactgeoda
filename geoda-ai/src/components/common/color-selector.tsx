import React from 'react';
import {Select, SelectItem} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {ColorPalette} from '@kepler.gl/components';
import {ALL_COLOR_RANGES} from '@/utils/color-utils';

type ColorSelectorProps = {
  numberOfColors?: number;
  defaultColorRange?: string;
  onSelectColorRange: (colorRange: ColorRange) => void;
};

export function ColorSelector({
  numberOfColors = 5,
  defaultColorRange,
  onSelectColorRange
}: ColorSelectorProps) {
  const colorRanges = ALL_COLOR_RANGES.filter(colorRange => {
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
      selectedKeys={[`${selectedColorRange.name}`]}
    >
      {colorRange => (
        <SelectItem
          key={`${colorRange.name}`}
          onClick={() => onSelectColorRange(colorRange)}
          className="gap-0 py-0"
          textValue=""
          value=""
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
