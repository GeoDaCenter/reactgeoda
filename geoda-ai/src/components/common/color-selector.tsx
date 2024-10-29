import React, {useEffect, useState} from 'react';
import {Card, CardBody, Select, SelectItem} from '@nextui-org/react';
import {ColorRange} from '@kepler.gl/constants';
import {ColorPalette} from '@kepler.gl/components';
import {getColorRanges, UNIQUE_COLOR_TYPES} from '@/utils/color-utils';

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
  const [selectedColorType, setSelectedColorType] = useState(colorType || 'all');

  // Add this effect to update selectedColorType when colorType changes
  useEffect(() => {
    setSelectedColorType(colorType || '');
  }, [colorType]);

  // handle color scheme selection change
  const onColorSchemeSelectionChange = (
    keys: 'all' | (Set<React.Key> & {anchorKey?: string; currentKey?: string})
  ) => {
    if (keys === 'all') return;
    const selectValue = keys.currentKey;
    const colorRanges = getColorRanges(numberOfColors, selectedColorType);
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
    setSelectedColorType(selectValue as string);
    // trigger color scheme selection change
    const colorRanges = getColorRanges(numberOfColors, selectValue as string);
    const selectedColorRange = colorRanges.find(colorRange => colorRange.type === selectValue);
    if (selectedColorRange) {
      onSelectColorRange(selectedColorRange);
    }
  };

  return (
    <Card className="w-full bg-default-100">
      <CardBody>
        <span className="mb-2 text-tiny">Color Scheme</span>
        <Select
          label="Color Type"
          disallowEmptySelection={true}
          className="max-w"
          size="sm"
          selectedKeys={
            selectedColorType && selectedColorType !== 'all' ? [`${selectedColorType}`] : ['all']
          }
          onSelectionChange={onColorTypeSelectionChange}
          aria-label="Select color type"
        >
          {['all', ...UNIQUE_COLOR_TYPES].map(_colorType => (
            <SelectItem key={`${_colorType}`} textValue={_colorType}>
              {_colorType}
            </SelectItem>
          ))}
        </Select>
        <Select
          label=""
          className="max-w"
          disallowEmptySelection={true}
          items={getColorRanges(numberOfColors, selectedColorType)}
          renderValue={items => {
            return items.map((item, index) => (
              <ColorPalette
                key={`${item.data?.name}-${index}`}
                colors={item.data?.colors || []}
                isReversed={false}
                isSelected={item.data?.name === defaultColorRange}
              />
            ));
          }}
          selectedKeys={defaultColorRange ? [`${defaultColorRange}`] : []}
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
                isSelected={colorRange.name === defaultColorRange}
              />
            </SelectItem>
          )}
        </Select>
      </CardBody>
    </Card>
  );
}
