import {Dispatch} from 'react';
import colorbrewer from 'colorbrewer';
import {UnknownAction} from 'redux';
import {naturalBreaks, quantileBreaks} from 'geoda-wasm';
import {addLayer, reorderLayer} from '@kepler.gl/actions';

import {MAP_ID, MappingTypes} from '@/constants';
import {GeoDaState} from '@/store';

type CreateCustomScaleMapProps = {
  dispatch: Dispatch<UnknownAction>;
  geodaState: GeoDaState;
  breaks: number[];
  mappingType: string;
  colorFieldName: string;
};

type CreateUniqueValuesMapProps = {
  dispatch: Dispatch<UnknownAction>;
  geodaState: GeoDaState;
  uniqueValues: number[];
  hexColors: string[];
  legendLabels: string[];
  mappingType: string;
  colorFieldName: string;
};

export function createUniqueValuesMap({
  dispatch,
  geodaState,
  uniqueValues,
  legendLabels,
  hexColors,
  mappingType,
  colorFieldName
}: CreateUniqueValuesMapProps) {
  // get tableName and layer
  const tableName = geodaState.root.file.rawFileData.name;
  const layer = geodaState.keplerGl[MAP_ID].visState.layers.find((layer: any) =>
    tableName.startsWith(layer.config.label)
  );

  // get colors, colorMap, colorLegend to create colorRange
  const colors = hexColors.map(color => `#${color.match(/[0-9a-f]{2}/g)?.join('')}`);
  const colorMap = colors.map((color, index) => {
    return [uniqueValues[index], color];
  });
  const colorLegend = colors.map((color, index) => ({
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
  const dataId = layer.config.dataId;
  // generate random id for a new layer
  const id = Math.random().toString(36).substring(7);
  // create a new Layer
  const newLayer = {
    id,
    type: 'geojson',
    config: {
      dataId,
      columns: {geojson: layer.config.columns.geojson.value},
      label: `${mappingType} Map`,
      colorScale: 'ordinal',
      colorField: {
        name: `${colorFieldName}`,
        type: 'real'
      },
      visConfig: {
        ...layer.config.visConfig,
        colorRange,
        colorDomain: uniqueValues
      },
      isVisible: true
    }
  };
  // dispatch action to add new layer in kepler
  dispatch(addLayer(newLayer, dataId));
  // dispatch action to reorder layer
  const existingLayerIds = geodaState.keplerGl[MAP_ID].visState.layers.map(
    (layer: any) => layer.id
  );
  dispatch(reorderLayer([newLayer.id, ...existingLayerIds]));
}

export function useMapping() {
  const createCustomScaleMap = ({
    dispatch,
    geodaState,
    breaks,
    mappingType,
    colorFieldName
  }: CreateCustomScaleMapProps) => {
    // get tableName and layer
    const tableName = geodaState.root.file.rawFileData.name;
    const layer = geodaState.keplerGl[MAP_ID].visState.layers.find((layer: any) =>
      tableName.startsWith(layer.config.label)
    );

    // get colors, colorMap, colorLegend to create colorRange
    const hexColors = colorbrewer.YlOrBr[breaks.length + 1];
    const colors = hexColors.map(color => `#${color.match(/[0-9a-f]{2}/g)?.join('')}`);
    const colorMap = colors.map((color, index) => {
      return [breaks[index], color];
    });
    const colorLegend = colors.map((color, index) => ({
      color,
      legend: `${breaks[index]}`
    }));
    const colorRange = {
      category: 'custom',
      type: 'diverging',
      name: 'ColorBrewer RdBu-5',
      colors,
      colorMap,
      colorLegend
    };

    // get dataId
    const dataId = layer.config.dataId;
    // generate random id for a new layer
    const id = Math.random().toString(36).substring(7);
    // create a new Layer
    const newLayer = {
      id,
      type: 'geojson',
      config: {
        dataId,
        columns: {geojson: layer.config.columns.geojson.value},
        label: `${mappingType} Map`,
        colorScale: 'custom',
        colorField: {
          name: `${colorFieldName}`,
          type: 'real'
        },
        visConfig: {
          ...layer.config.visConfig,
          colorRange,
          colorDomain: breaks
        },
        isVisible: true
      }
    };
    // dispatch action to add new layer in kepler
    dispatch(addLayer(newLayer, dataId));
    // dispatch action to reorder layer
    const existingLayerIds = geodaState.keplerGl[MAP_ID].visState.layers.map(
      (layer: any) => layer.id
    );
    dispatch(reorderLayer([newLayer.id, ...existingLayerIds]));
  };

  return {createCustomScaleMap};
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
  }
  return [];
}
