import {VisState} from '@kepler.gl/schemas';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';

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

export function getKeplerLayer(tableName: string, visState: VisState): GeojsonLayer | null {
  const layer = visState.layers.find((layer: Layer) => {
    return layer instanceof GeojsonLayer && tableName.startsWith(layer.config.label);
  }); 
  if (layer instanceof GeojsonLayer) {
    return layer;
  }
  return null;
}