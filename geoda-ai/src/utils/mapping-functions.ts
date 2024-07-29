import {Dispatch} from 'react';
import {UnknownAction} from 'redux';
import {
  naturalBreaks,
  quantileBreaks,
  equalIntervalBreaks,
  hinge15Breaks,
  hinge30Breaks,
  percentileBreaks,
  standardDeviationBreaks
} from 'geoda-wasm';
import {LayerClasses} from '@kepler.gl/layers';
import {ColorMap, ColorRange} from '@kepler.gl/constants';

import {MappingTypes} from '@/constants';
import {generateRandomId} from './ui-utils';
import {getDefaultColorRange} from './color-utils';
import {numericFormatter} from './plots/format-utils';
import {findDefaultLayer} from '@kepler.gl/reducers';
import KeplerTable from '@kepler.gl/table';

function createKeplerLayer({
  dataset,
  colorFieldName,
  colorFieldType,
  colorRange,
  colorScale,
  colorDomain,
  label
}: {
  dataset: KeplerTable;
  colorFieldName: string;
  colorFieldType: 'real' | 'string';
  colorRange: ColorRange;
  colorScale: 'ordinal' | 'custom';
  colorDomain: number[];
  label: string;
}) {
  const dataId = dataset.id;
  const id = generateRandomId();
  const defaultLayers = findDefaultLayer(dataset, LayerClasses);
  if (!defaultLayers || defaultLayers.length === 0) {
    throw new Error('Create Kepler layer failed: no default layer found');
  }
  const defaultLayer = defaultLayers[0];
  // reconstruct columns from defaultLayer
  const columns = Object.keys(defaultLayer.config.columns).reduce((acc, c) => {
    return {...acc, [c]: defaultLayer.config.columns[c].value};
  }, {});

  const newLayer = {
    id,
    type: defaultLayer.type,
    config: {
      dataId,
      columns,
      label,
      colorScale,
      colorField: {
        name: colorFieldName,
        type: colorFieldType
      },
      visConfig: {
        ...defaultLayer.config.visConfig,
        colorRange,
        colorDomain,
        thickness: 0.2,
        opacity: 1
      },
      isVisible: true
    }
  };
  return newLayer;
}

type CreateUniqueValuesMapProps = {
  dispatch?: Dispatch<UnknownAction>;
  dataset: KeplerTable;
  uniqueValues: number[];
  hexColors: string[];
  legendLabels: string[];
  mappingType: string;
  colorFieldName: string;
  layerOrder?: string[];
  isPreview?: boolean;
};

export function createUniqueValuesMap({
  dataset,
  uniqueValues,
  legendLabels,
  hexColors,
  mappingType,
  colorFieldName
}: CreateUniqueValuesMapProps) {
  // get colors, colorMap, colorLegend to create colorRange
  const colors = hexColors;

  // get colorField type number or string by checking values in uniqueValues
  const colorFieldType = uniqueValues.every(value => typeof value === 'number') ? 'real' : 'string';

  const colorMap = colors?.map((color, index) => {
    return [uniqueValues[index], color];
  });

  const colorLegends: {[key: string]: string} = colors?.reduce(
    (prev, color, i) => {
      prev[color] = legendLabels[i];
      return prev;
    },
    {} as {[key: string]: string}
  ); // Add index signature to allow indexing with a string

  const customColorRange: ColorRange = {
    category: 'ordinal',
    type: 'diverging',
    name: 'ColorBrewer RdBu-5',
    colors,
    colorMap: colorMap as ColorMap,
    colorLegends
  };

  const label = `${mappingType}-${colorFieldName}`;
  // create a new Layer
  const newLayer = createKeplerLayer({
    dataset,
    colorFieldName,
    colorFieldType,
    colorRange: customColorRange,
    colorScale: 'ordinal',
    colorDomain: uniqueValues,
    label
  });
  // // dispatch action to add new layer in kepler
  // dispatch(addLayer(newLayer, dataset.id));
  // // dispatch action to reorder layer
  // if (isPreview) {
  //   dispatch(reorderLayer([...layerOrder, newLayer.id]));
  // }
  return newLayer;
}

type CreateCustomScaleMapProps = {
  dataset: KeplerTable;
  breaks: number[];
  mappingType: string;
  colorFieldName: string;
  colorRange?: ColorRange;
};

export function createCustomScaleMap({
  dataset,
  breaks,
  mappingType,
  colorFieldName,
  colorRange
}: CreateCustomScaleMapProps) {
  // get colors, colorMap, colorLegend to create colorRange
  let colors = getDefaultColorRange(breaks.length + 1)?.colors;
  if (colorRange) {
    colors = colorRange.colors;
  }

  const colorMap = colors?.map((color, index) => {
    return [breaks[index], color];
  });

  const colorLegends = colors?.reduce(
    (prev, color, i) => {
      const label =
        i === 0
          ? `<= ${numericFormatter(breaks[i])}`
          : i === colors.length - 1
            ? `> ${numericFormatter(breaks[i - 1])}`
            : `${numericFormatter(breaks[i - 1])} - ${numericFormatter(breaks[i])}`;
      prev[color] = label;
      return prev;
    },
    {} as {[key: string]: string}
  ); // Add index signature to allow indexing with a string

  const customColorRange: ColorRange = {
    category: 'custom',
    type: 'diverging',
    name: 'ColorBrewer RdBu-5',
    colors: colors || [],
    colorMap: colorMap as ColorMap,
    colorLegends,
    ...(colorRange || {})
  };

  // generate label for a new layer
  const label = `${mappingType}-${colorFieldName}-${breaks.length + 1}`;

  // todo: check if there is already a layer with the same label

  // create a new Layer
  const newLayer = createKeplerLayer({
    dataset,
    colorFieldName,
    colorFieldType: 'real',
    colorRange: customColorRange,
    colorScale: 'custom',
    colorDomain: breaks,
    label
  });

  // dispatch action to add new layer in kepler
  // dispatch(addLayer(newLayer, dataset.id));
  // if (isPreview) {
  //   dispatch(reorderLayer([...layerOrder, newLayer.id]));
  // }
  return newLayer;
}

export type CreateMapBreaksProps = {
  mappingType: string;
  k?: number;
  values: number[];
};

export async function createMapBreaks({
  mappingType,
  k = 5,
  values
}: CreateMapBreaksProps): Promise<number[]> {
  if (mappingType === MappingTypes.QUANTILE) {
    return await quantileBreaks(k, values);
  } else if (mappingType === MappingTypes.NATURAL_BREAK) {
    return await naturalBreaks(k, values);
  } else if (mappingType === MappingTypes.EQUAL_INTERVAL) {
    return await equalIntervalBreaks(k, values);
  } else if (mappingType === MappingTypes.BOX_MAP_15) {
    return await hinge15Breaks(values);
  } else if (mappingType === MappingTypes.BOX_MAP_30) {
    return await hinge30Breaks(values);
  } else if (mappingType === MappingTypes.PERCENTILE) {
    return await percentileBreaks(values);
  } else if (mappingType === MappingTypes.STD_MAP) {
    return await standardDeviationBreaks(values);
  }

  return [];
}
