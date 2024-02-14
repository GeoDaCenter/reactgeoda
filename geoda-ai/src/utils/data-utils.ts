import {VisState} from '@kepler.gl/schemas';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';
import {KeplerTable, Datasets} from '@kepler.gl/table';
import {DataContainerInterface} from '../../../../csds_kepler/src/utils/src/data-container-interface';
import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';

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
function isGeojsonLayer(layer: Layer): layer is GeojsonLayer {
  return layer.type === 'geojson';
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
  datasets: Datasets
): Array<number> {
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
    if (!Array.isArray(columnData) || columnData.some(item => typeof item !== 'number')) {
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
    const columnData = dataContainer.column ? [...dataContainer.column(columnIndex)] : [];
    if (!Array.isArray(columnData) || columnData.some(item => typeof item !== 'number')) {
      // handle error
      return [];
    }

    return columnData;
  }

  return [];
}

export function getDataContainer(
  tableName: string,
  datasets: Datasets
): DataContainerInterface | null {
  // get dataset from datasets if dataset.label === tableName
  const dataset = Object.values(datasets).find(
    (dataset: KeplerTable) => dataset.label === tableName
  );
  return dataset?.dataContainer || null;
}

export function getLayer(state: GeoDaState) {
  const tableName = state.root.file?.rawFileData?.name;
  return state.keplerGl[MAP_ID]?.visState?.layers.find((layer: Layer) =>
    tableName.startsWith(layer.config.label)
  );
}

export function getDataset(state: GeoDaState) {
  const tableName = state.root.file?.rawFileData?.name;
  const datasets: KeplerTable[] = Object.values(state.keplerGl[MAP_ID]?.visState?.datasets);
  const dataset = datasets.find((dataset: KeplerTable) => dataset.label === tableName);
  return dataset;
}
