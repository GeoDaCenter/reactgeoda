import {getDataContainer} from '@/utils/data-utils';
import {ErrorOutput, createErrorResult} from '../custom-functions';
import {VisState} from '@kepler.gl/schemas';

export type MetaDataCallbackOutput = {
  type: 'metadata';
  name: string;
  result: {
    datasetName: string;
    datasetId: string;
    numberOfRows: number;
    numberOfColumns: number;
    columnNames: string[];
    columnDataTypes: string[];
  };
};

export function getMetaDataCallback(
  {datasetName, datasetId}: {datasetName: string; datasetId: string},
  {tableName, visState}: {tableName: string; visState: VisState}
): MetaDataCallbackOutput | ErrorOutput {
  if (!tableName) {
    return createErrorResult('Error: table name is empty');
  }

  const dataContainer = getDataContainer(tableName, visState.datasets);
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
      datasetName,
      datasetId,
      numberOfRows: dataContainer.numRows(),
      numberOfColumns: dataContainer.numColumns(),
      columnNames,
      columnDataTypes
    }
  };
}
