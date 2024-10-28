import React, {useState} from 'react';
import {Card, CardBody, Select, SelectItem} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {ColorPalette} from '@kepler.gl/components';
import {ALL_COLOR_RANGES, UNIQUE_COLOR_TYPES} from '@/utils/color-utils';

type ColorSelectorProps = {
  numberOfColors?: number;
  colorType?: string;
  defaultColorRange?: string;
  onSelectColorRange: (colorRange: ColorRange) => void;
};

/**
 * ColorSelector component for mapping
 * @param {number} numberOfColors - number of colors to display
 * @param {string} colorType - color type to filter
 * @param {string} defaultColorRange - default color range to select
 * @param {function} onSelectColorRange - callback function to handle color range selection
 * @returns {React.ReactNode} - ColorSelector component
 */
export function ColorSelector({
  numberOfColors = 5,
  colorType,
  defaultColorRange,
  onSelectColorRange
}: ColorSelectorProps) {
  const [selectedColorType, setSelectedColorType] = useState(colorType);

  // filter color ranges by number of colors and color type
  const colorRanges = ALL_COLOR_RANGES.filter(colorRange => {
    return (
      colorRange.colors.length === numberOfColors &&
      // filter by color type if provided
      (selectedColorType ? colorRange.type === selectedColorType : true)
    );
  });

  // find the default color range
  const selectedColorRange =
    colorRanges.find(colorRange => colorRange.name === defaultColorRange) || colorRanges[0];

  // handle color scheme selection change
  const onColorSchemeSelectionChange = (
    keys: 'all' | (Set<React.Key> & {anchorKey?: string; currentKey?: string})
  ) => {
    if (keys === 'all') return;
    const selectValue = keys.currentKey;
    const selectedColorRange = colorRanges.find(colorRange => colorRange.name === selectValue);
    if (selectedColorRange) {
      onSelectColorRange(selectedColorRange);
    }
  };

  // handle color type selection change
  const onColorTypeSelectionChange = (
    keys: 'all' | (Set<React.Key> & {anchorKey?: string; currentKey?: string})
  ) => {
    if (keys === 'all') return;
    const selectValue = keys.currentKey;
    setSelectedColorType(selectValue);
    // trigger color scheme selection change
    const selectedColorRange = colorRanges.find(colorRange => colorRange.type === selectValue);
    if (selectedColorRange) {
      onSelectColorRange(selectedColorRange);
    }
  };

  return selectedColorRange ? (
    <Card className="w-full bg-default-100">
      <CardBody>
        <span className="mb-2 text-tiny">Color Scheme</span>
        <Select
          label="Color Type"
          className="max-w"
          size="sm"
          selectedKeys={selectedColorType ? [`${selectedColorType}`] : []}
          onSelectionChange={onColorTypeSelectionChange}
          aria-label="Select color type"
        >
          {UNIQUE_COLOR_TYPES.map(_colorType => (
            <SelectItem key={`${_colorType}`} textValue={_colorType}>
              {_colorType}
            </SelectItem>
          ))}
        </Select>
        <Select
          label=""
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
          onSelectionChange={onColorSchemeSelectionChange}
          aria-label="Select color scheme"
        >
          {colorRange => (
            <SelectItem
              key={`${colorRange.name}`}
              className="gap-0 py-0"
              textValue={colorRange.name}
            >
              <ColorPalette
                colors={colorRange.colors}
                isReversed={false}
                isSelected={colorRange.name === selectedColorRange.name}
              />
            </SelectItem>
          )}
        </Select>
      </CardBody>
    </Card>
  ) : null;
}
