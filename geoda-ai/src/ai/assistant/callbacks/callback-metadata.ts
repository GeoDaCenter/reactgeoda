import {getKeplerLayer} from '@/utils/data-utils';
import {ErrorOutput, createErrorResult} from '../custom-functions';
import {VisState} from '@kepler.gl/schemas';

type MetaDataCallbackOutput = {
  type: 'metadata';
  name: string;
  result: {
    numberOfRows: number;
    numberOfColumns: number;
    columnNames: string[];
    columnDataTypes: string[];
  };
};

export async function getMetaDataCallback(
  dataName: string,
  {tableName, visState}: {tableName: string; visState: VisState}
): Promise<MetaDataCallbackOutput | ErrorOutput> {
  if (!tableName) {
    return createErrorResult('Error: table name is empty');
  }

  // get kepler.gl layer using tableName
  const keplerLayer = getKeplerLayer(tableName, visState);
  if (!keplerLayer) {
    return createErrorResult('Error: layer is empty');
  }

  const dataContainer = keplerLayer.dataContainer;
  if (!dataContainer) {
    return createErrorResult('Error: data container is empty');
  }

  const columnNames: string[] = [];
  const columnDataTypes: string[] = [];
  for (let i = 0; i < dataContainer.numColumns(); i++) {
    const field = dataContainer.getField?.(i);
    if (field) {
      columnNames.push(field.name);
      columnDataTypes.push(field.type);
    }
  }

  return {
    type: 'metadata',
    name: 'metadata',
    result: {
      numberOfRows: dataContainer.numRows(),
      numberOfColumns: dataContainer.numColumns(),
      columnNames,
      columnDataTypes
    }
  };
}
