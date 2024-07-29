import {MAP_ID, MappingTypes} from '@/constants';
import {GeoDaState} from '@/store';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {
  createCustomScaleMap,
  createMapBreaks,
  createUniqueValuesMap
} from '@/utils/mapping-functions';
import {CreateMapPayloadProps, CreateRatesMapPayloadProps} from '@/actions';
import {calculateRates} from 'geoda-wasm';
import KeplerTable from '@kepler.gl/table';
import {ColorRange} from '@kepler.gl/constants';

async function createKeplerLayer({
  fieldName,
  values,
  classficationMethod,
  numberOfCategories,
  keplerDataset,
  colorRange
}: {
  fieldName: string;
  values: unknown[];
  classficationMethod: string;
  numberOfCategories: number;
  keplerDataset: KeplerTable;
  colorRange: ColorRange;
}) {
  let newLayer = null;
  if (classficationMethod === MappingTypes.UNIQUE_VALUES) {
    const uniqueValues = Array.from(new Set(values));
    // if number of categories is less than unique values, trim uniqueValues to match the number of categories
    if (uniqueValues.length > numberOfCategories) {
      uniqueValues.splice(numberOfCategories);
    }
    const legendLabels = uniqueValues.map(v => `${v}`);
    // create unique values map in kepler.gl
    newLayer = createUniqueValuesMap({
      dataset: keplerDataset,
      uniqueValues,
      legendLabels,
      hexColors: colorRange?.colors || [],
      mappingType: classficationMethod,
      colorFieldName: fieldName
    });
  } else {
    // run map breaks
    const breaks = await createMapBreaks({
      mappingType: classficationMethod,
      k: numberOfCategories,
      values: values as number[]
    });
    // create new layer
    newLayer = createCustomScaleMap({
      dataset: keplerDataset,
      colorFieldName: fieldName,
      mappingType: classficationMethod,
      colorRange,
      breaks
    });
  }
  return newLayer;
}

export async function createMapUpdater(
  payload: CreateMapPayloadProps,
  keplerState: GeoDaState['keplerGl']
) {
  const {dataId, variable, classficationMethod, numberOfCategories, colorRange} = payload;

  // get kepler dataset using datasetId from keplerState[MAP_ID].visState.datasets
  const keplerDataset = keplerState[MAP_ID].visState.datasets[dataId];

  if (!keplerDataset) {
    console.error('No kepler dataset found for dataId:', dataId);
    return null;
  }

  const values = getColumnDataFromKeplerDataset(variable, keplerDataset);
  const newLayer = await createKeplerLayer({
    fieldName: variable,
    values,
    classficationMethod,
    numberOfCategories,
    keplerDataset,
    colorRange
  });

  return newLayer;
}

export async function createRatesMapUpdater(
  payload: CreateRatesMapPayloadProps,
  keplerState: GeoDaState['keplerGl'],
  weights: GeoDaState['root']['weights']
) {
  const {
    dataId,
    method,
    eventVariable,
    baseVariable,
    weightsId,
    classficationMethod,
    numberOfCategories,
    colorRange
  } = payload;
  // get kepler dataset using datasetId from keplerState[MAP_ID].visState.datasets
  const keplerDataset: KeplerTable = keplerState[MAP_ID].visState.datasets[dataId];

  if (!keplerDataset) {
    console.error('No kepler dataset found for dataId:', dataId);
    return {newlayer: null, values: null};
  }

  const eventValues = getColumnDataFromKeplerDataset(eventVariable, keplerDataset);
  const baseValues = getColumnDataFromKeplerDataset(baseVariable, keplerDataset);

  // get neighbors from weightsId
  const neighbors = weights.find(w => w.weightsMeta.id === weightsId)?.weights;

  // compute rates values
  const values = calculateRates({eventValues, baseValues, method, neighbors});

  // generate label
  const label = `${method}_${eventVariable}_${baseVariable}`.replace(/\s/g, '_');

  const newLayer = await createKeplerLayer({
    fieldName: label,
    values,
    classficationMethod,
    numberOfCategories,
    keplerDataset,
    colorRange
  });

  return {newLayer, values};
}
