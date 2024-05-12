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
};

export function createUniqueValuesMap({
  dispatch,
  layer,
  uniqueValues,
  legendLabels,
  hexColors,
  mappingType,
  colorFieldName
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
      label: `${mappingType} Map - ${colorFieldName}`,
      colorScale: 'ordinal',
      colorField: {
        name: `${colorFieldName}`,
        type: 'real'
      },
      visConfig: {
        ...layer?.config.visConfig,
        colorRange,
        colorDomain: uniqueValues,
        thickness: 0.2
      },
      isVisible: true
    }
  };
  // dispatch action to add new layer in kepler
  dispatch(addLayer(newLayer, dataId));
  // dispatch action to reorder layer
  const existingLayerIds = layer.id;
  dispatch(reorderLayer([newLayer.id, existingLayerIds]));
}

type CreateCustomScaleMapProps = {
  dispatch: Dispatch<UnknownAction>;
  layer: Layer;
  breaks: number[];
  mappingType: string;
  colorFieldName: string;
  isPreview?: boolean;
  colorRange?: ColorRange;
};

export function createCustomScaleMap({
  dispatch,
  layer,
  breaks,
  mappingType,
  colorFieldName,
  isPreview,
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
  const id = generateRandomId();
  const label = `${mappingType} Map - ${colorFieldName} (${breaks.length + 1} classes)`;
  // create a new Layer
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
        thickness: 0.2
      },
      isVisible: true
    }
  };
  // dispatch action to add new layer in kepler
  dispatch(addLayer(newLayer, dataId));
  // dispatch action to reorder layer
  const existingLayerIds = layer.id;
  if (existingLayerIds && isPreview) {
    dispatch(reorderLayer([existingLayerIds, newLayer.id]));
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
