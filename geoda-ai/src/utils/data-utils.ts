import {VisState} from '@kepler.gl/schemas';
import {GeojsonLayer, Layer, PointLayer} from '@kepler.gl/layers';
import {KeplerTable, Datasets as KeplerDatasets} from '@kepler.gl/table';
import {DataContainerInterface} from '../../../../csds_kepler/src/utils/src/data-container-interface';
import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';
import {mainTableNameSelector} from '@/store/selectors';
import {DatasetProps as GeoDaDataset} from '@/actions';
import {BinaryFeatureCollection} from '@loaders.gl/schema';
import {getBinaryGeometryTemplate} from '@loaders.gl/arrow';
/**
 * Get the names of the integer and string fields from the kepler.gl layer
 * @param tableName the name of the table
 * @param visState the kepler.gl visState
 * @returns Array of field names
 */
export function getIntegerAndStringFieldNames(
  tableName: string,
  visState: VisState
): Array<string> {
  // get kepler.gl layer using tableName
  const layer = getKeplerLayer(tableName, visState);

  if (layer) {
    // get numeric columns from layer
    const columnNames: string[] = [];
    const dataContainer = layer.dataContainer;
    for (let i = 0; dataContainer && i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && (field.type === 'string' || field.type === 'integer')) {
        columnNames.push(field.name);
      }
    }
    return columnNames;
  }

  return [];
}

/**
 * Get the kepler.gl layer using the table name
 * @param tableName the name of the table
 * @param visState the kepler.gl visState
 * @returns GeojsonLayer or null
 */
export function getKeplerLayer(tableName: string, visState: VisState): GeojsonLayer | null {
  const layer = visState.layers.find((layer: Layer) => {
    return tableName.startsWith(layer.config.label);
  });
  return layer as GeojsonLayer;
}

// type guard function checks if the layer is a GeojsonLayer
export function isGeojsonLayer(layer: Layer): layer is GeojsonLayer {
  return layer.type === 'geojson';
}

export function isPointLayer(layer: Layer): layer is PointLayer {
  return layer.type === 'point';
}

/**
 * Get the names of the numeric fields from the kepler.gl layer
 * @param tableName the name of the table
 * @param visState the kepler.gl visState
 * @returns the names of the numeric fields
 */
export function getNumericFieldNames(layer: Layer): Array<string> {
  if (layer && isGeojsonLayer(layer)) {
    // get numeric columns from layer
    const columnNames: string[] = [];
    const dataContainer = layer.dataContainer;
    for (let i = 0; dataContainer && i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && (field.type === 'integer' || field.type === 'real')) {
        columnNames.push(field.name);
      }
    }
    return columnNames;
  }

  return [];
}

export function getAllFieldNames(dataset: KeplerTable): Array<string> {
  return dataset.fields.map(field => field.name);
}

export function getNumericFieldNamesFromDataset(dataset: KeplerTable): Array<string> {
  return dataset.fields
    .filter(field => field.type === 'integer' || field.type === 'real')
    .map(field => field.name);
}

export function getIntegerFieldNamesFromDataset(dataset: KeplerTable): Array<string> {
  return dataset.fields.filter(field => field.type === 'integer').map(field => field.name);
}

export function getStringFieldNamesFromDataset(dataset: KeplerTable): Array<string> {
  return dataset.fields.filter(field => field.type === 'string').map(field => field.name);
}

export function getIntegerAndStringFieldNamesFromDataset(dataset: KeplerTable): Array<string> {
  return dataset.fields
    .filter(field => field.type === 'integer' || field.type === 'string')
    .map(field => field.name);
}

/**
 * Get the column data from the kepler.gl layer using the table name and column name
 * @param tableName the name of the table
 * @param columnName the name of the column
 * @param visState the kepler.gl visState
 * @returns the column data
 */
export function getColumnDataFromKeplerLayer(
  tableName: string,
  columnName: string,
  datasets: KeplerDatasets
): Array<number | string> {
  // get dataset from datasets if dataset.label === tableName
  const dataset = Object.values(datasets).find(
    (dataset: KeplerTable) => dataset.label === tableName
  );
  if (dataset) {
    const dataContainer = dataset.dataContainer;
    if (!dataContainer) {
      return [];
    }
    // get column index from dataContainer
    let columnIndex = -1;
    for (let i = 0; i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && field.name === columnName) {
        columnIndex = i;
        break;
      }
    }

    // get column data from dataContainer
    const columnData = dataContainer.column ? [...dataContainer.column(columnIndex)] : [];
    if (!Array.isArray(columnData)) {
      // handle error
      return [];
    }

    return columnData;
  }

  return [];
}

/**
 * Check if the field name exists in the kepler.gl dataset
 * @param tableName
 * @param fieldName
 * @param visState
 * @returns
 */
export function checkIfFieldNameExists(
  tableName: string,
  fieldName: string,
  visState: VisState
): boolean {
  // get dataset using tableName
  const dataset = Object.values(visState.datasets).find(dataset => dataset.label === tableName);
  // get fields from dataset
  const fields = dataset?.fields;
  // check if fieldName exists in fields
  const isExisted = fields?.some(field => field.name === fieldName) || false;
  return isExisted;
}

export function getKeplerField(dataset: KeplerTable, fieldName: string) {
  return dataset.fields.find(field => field.name === fieldName);
}

// get data type of a specific column
export function getColumnDataType(
  columnName: string,
  dataContainer: DataContainerInterface | null
): string {
  // get dataset from datasets if dataset.label === tableName
  if (dataContainer) {
    // get column index from dataContainer
    let columnIndex = -1;
    for (let i = 0; i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && field.name === columnName) {
        columnIndex = i;
        break;
      }
    }

    // get column data from dataContainer
    const columnData = dataContainer.column ? [...dataContainer.column(columnIndex)] : [];
    if (!Array.isArray(columnData) || columnData.some(item => typeof item !== 'number')) {
      // handle error
      return 'string';
    }

    return 'number';
  }

  return 'string';
}

export function getColumnDataFromKeplerDataset(
  columnName: string,
  dataset: KeplerTable
): Array<number> {
  return getColumnData(columnName, dataset.dataContainer);
}

export function getColumnData(
  columnName: string,
  dataContainer: DataContainerInterface | null
): Array<number> {
  // get dataset from datasets if dataset.label === tableName
  if (dataContainer) {
    // get column index from dataContainer
    let columnIndex = -1;
    for (let i = 0; i < dataContainer.numColumns(); i++) {
      const field = dataContainer.getField?.(i);
      if (field && field.name === columnName) {
        columnIndex = i;
        break;
      }
    }

    // get column data from dataContainer
    return getColumnDataByIndex(columnIndex, dataContainer);
  }

  return [];
}

export function getColumnDataByIndex(
  columnIndex: number,
  dataContainer: DataContainerInterface | null
) {
  if (dataContainer) {
    const columnData = dataContainer.column ? [...dataContainer.column(columnIndex)] : [];
    if (!Array.isArray(columnData)) {
      return [];
    }
    return columnData;
  }
  return [];
}

export function getDataContainer(
  tableName: string,
  datasets: KeplerDatasets
): DataContainerInterface | null {
  // get dataset from datasets if dataset.label === tableName
  const dataset = Object.values(datasets).find(
    (dataset: KeplerTable) => dataset.label === tableName
  );
  return dataset?.dataContainer || null;
}

export function getLayer(state: GeoDaState) {
  const tableName = mainTableNameSelector(state);
  return state.keplerGl[MAP_ID]?.visState?.layers.find((layer: Layer) =>
    tableName.startsWith(layer.config.label)
  );
}

export function getDataset(state: GeoDaState) {
  const tableName = mainTableNameSelector(state);
  const datasets: KeplerTable[] = Object.values(state.keplerGl[MAP_ID]?.visState?.datasets);
  const dataset = datasets.find((dataset: KeplerTable) => dataset.label === tableName);
  return dataset;
}

// typeguard function to check if array is number[]
export function isNumberArray(array: Array<number | string>): array is number[] {
  return array.every(item => typeof item === 'number');
}

export function getDatasetName(datasets: GeoDaDataset[], dataId: string): string {
  const dataset = datasets.find(dataset => dataset.dataId === dataId);
  return dataset ? dataset.fileName : '';
}

export function getBinaryGeometryTypeFromPointLayer() {
  return {
    point: true,
    line: false,
    polygon: false
  };
}

export function getBinaryGeometriesFromPointLayer(
  layer: PointLayer,
  dataset: KeplerTable
): BinaryFeatureCollection[] {
  const {lat, lng} = layer.config.columns;

  // get column data from the kepler.gl dataset
  const latData = getColumnDataByIndex(lat.fieldIdx, dataset.dataContainer);
  const lngData = getColumnDataByIndex(lng.fieldIdx, dataset.dataContainer);

  // compose positions by combining lat and lng into a Float64Array
  const positions = new Float64Array(latData.length * 2);
  for (let i = 0; i < latData.length; i++) {
    positions[i * 2] = lngData[i];
    positions[i * 2 + 1] = latData[i];
  }

  // create featureIds
  const featureIds = new Uint32Array(latData.length);
  const globalFeatureIds = new Uint32Array(latData.length);
  for (let i = 0; i < latData.length; i++) {
    featureIds[i] = i;
    globalFeatureIds[i] = i;
  }

  // create properties
  const properties = new Array(latData.length).fill({index: 0});
  for (let i = 0; i < latData.length; i++) {
    properties[i].index = i;
  }

  return [
    {
      shape: 'binary-feature-collection',
      points: {
        ...getBinaryGeometryTemplate(),
        type: 'Point',
        globalFeatureIds: {value: globalFeatureIds, size: 1},
        positions: {
          value: positions,
          size: 2
        },
        properties,
        featureIds: {value: featureIds, size: 1}
      },
      lines: {
        ...getBinaryGeometryTemplate(),
        type: 'LineString',
        pathIndices: {value: new Uint16Array(0), size: 1}
      },
      polygons: {
        ...getBinaryGeometryTemplate(),
        type: 'Polygon',
        polygonIndices: {value: new Uint16Array(0), size: 1},
        primitivePolygonIndices: {value: new Uint16Array(0), size: 1}
      }
    }
  ];
}
