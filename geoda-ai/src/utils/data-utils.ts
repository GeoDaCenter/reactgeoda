import {VisState} from '@kepler.gl/schemas';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';

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

  if (layer instanceof GeojsonLayer) {
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
    return layer instanceof GeojsonLayer && tableName.startsWith(layer.config.label);
  });
  if (layer instanceof GeojsonLayer) {
    return layer;
  }
  return null;
}

/**
 * Get the names of the numeric fields from the kepler.gl layer
 * @param tableName the name of the table
 * @param visState the kepler.gl visState
 * @returns the names of the numeric fields
 */
export function getNumericFieldNames(tableName: string, visState: VisState): Array<string> {
  // get kepler.gl layer using tableName
  const layer = getKeplerLayer(tableName, visState);

  if (layer instanceof GeojsonLayer) {
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
  visState: VisState
): Array<number> {
  const layer = getKeplerLayer(tableName, visState);

  if (layer instanceof GeojsonLayer) {
    const dataContainer = layer.dataContainer;
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
