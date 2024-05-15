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
import {addLayer, reorderLayer} from '@kepler.gl/actions';
import {Layer} from '@kepler.gl/layers';
import {ColorRange} from '@kepler.gl/constants';

import {MappingTypes} from '@/constants';
import {generateRandomId} from './ui-utils';
import {getDefaultColorRange} from './color-utils';

type CreateUniqueValuesMapProps = {
  dispatch: Dispatch<UnknownAction>;
  layer: Layer;
  uniqueValues: number[];
  hexColors: string[];
  legendLabels: string[];
  mappingType: string;
  colorFieldName: string;
  layerOrder: string[];
  isPreview?: boolean;
};

export function createUniqueValuesMap({
  dispatch,
  layer,
  uniqueValues,
  legendLabels,
  hexColors,
  mappingType,
  colorFieldName,
  layerOrder,
  isPreview
}: CreateUniqueValuesMapProps) {
  // get colors, colorMap, colorLegend to create colorRange
  const colors = getDefaultColorRange(hexColors.length)?.colors;
  const colorMap = colors?.map((color, index) => {
    return [uniqueValues[index], color];
  });
  const colorLegend = colors?.map((color, index) => ({
    color,
    legend: `${legendLabels[index]}`
  }));
  const colorRange = {
    category: 'ordinal',
    type: 'diverging',
    name: 'ColorBrewer RdBu-5',
    colors,
    colorMap,
    colorLegend
  };

  // get dataId
  const dataId = layer?.config.dataId;
  // generate random id for a new layer
  const id = generateRandomId();
  // create a new Layer
  const newLayer = {
    id,
    type: 'geojson',
    config: {
      dataId,
      columns: {geojson: layer?.config.columns.geojson.value},
      label: `${mappingType}-${colorFieldName}`,
      colorScale: 'ordinal',
      colorField: {
        name: `${colorFieldName}`,
        type: 'real'
      },
      visConfig: {
        ...layer?.config.visConfig,
        colorRange,
        colorDomain: uniqueValues,
        thickness: 0.2,
        opacity: 1
      },
      isVisible: true
    }
  };

  // dispatch action to add new layer in kepler
  dispatch(addLayer(newLayer, dataId));
  // dispatch action to reorder layer
  if (isPreview) {
    dispatch(reorderLayer([...layerOrder, newLayer.id]));
  }
}

type CreateCustomScaleMapProps = {
  dispatch: Dispatch<UnknownAction>;
  layer: Layer;
  breaks: number[];
  mappingType: string;
  colorFieldName: string;
  isPreview?: boolean;
  colorRange?: ColorRange;
  layerOrder: string[];
};

export function createCustomScaleMap({
  dispatch,
  layer,
  breaks,
  mappingType,
  colorFieldName,
  isPreview,
  colorRange,
  layerOrder
}: CreateCustomScaleMapProps) {
  // get colors, colorMap, colorLegend to create colorRange
  let colors = getDefaultColorRange(breaks.length + 1)?.colors;
  if (colorRange) {
    colors = colorRange.colors;
  }

  const colorMap = colors?.map((color, index) => {
    return [breaks[index], color];
  });
  const colorLegend = colors?.map((color, index) => ({
    color,
    legend: `${breaks[index]}`
  }));

  const customColorRange = {
    category: 'custom',
    type: 'diverging',
    name: 'ColorBrewer RdBu-5',
    colors,
    colorMap,
    colorLegend,
    ...(colorRange || {})
  };

  // get dataId
  const dataId = layer?.config.dataId;
  // generate random id for a new layer
  const label = `${mappingType}-${colorFieldName}-${breaks.length + 1}`;
  // check if there is already a layer with the same label

  // create a new Layer
  const id = generateRandomId();
  const newLayer = {
    id,
    type: 'geojson',
    config: {
      dataId,
      columns: {geojson: layer?.config.columns.geojson.value},
      label,
      colorScale: 'custom',
      colorField: {
        name: `${colorFieldName}`,
        type: 'real'
      },
      visConfig: {
        ...layer?.config.visConfig,
        colorRange: customColorRange,
        colorDomain: breaks,
        thickness: 0.2,
        opacity: 1
      }
    }
  };

  // dispatch action to add new layer in kepler
  dispatch(addLayer(newLayer, dataId));
  // dispatch action to reorder layer
  if (isPreview) {
    // dispatch(reorderLayer([...layerOrder, newLayer.id]));
    dispatch(reorderLayer([...layerOrder]));
  }
  return newLayer;
}

export async function createMapBreaks(
  mappingType: string,
  k: number,
  values: number[]
): Promise<number[]> {
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
