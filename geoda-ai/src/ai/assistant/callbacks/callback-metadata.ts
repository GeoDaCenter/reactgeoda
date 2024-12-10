import {getDataContainer} from '@/utils/data-utils';
import {ErrorOutput} from '../custom-functions';
import {VisState} from '@kepler.gl/schemas';

export type MetaDataCallbackOutput = {
  type: 'metadata';
  name: string;
  result: {
    datasetName: string;
    datasetId: string;
    columns: Record<string, string>;
  };
};

export function getMetaDataCallback(
  {datasetName, datasetId}: {datasetName: string; datasetId: string},
  {tableName, visState}: {tableName: string; visState: VisState}
): MetaDataCallbackOutput | ErrorOutput {
  if (!tableName) {
    return {
      type: 'error',
      name: 'Error',
      result: {success: false, details: 'table name is empty'}
    };
  }

  const dataContainer = getDataContainer(tableName, visState.datasets);
  if (!dataContainer) {
    return {
      type: 'error',
      name: 'Error',
      result: {success: false, details: 'data container is empty'}
    };
  }

  const columns: Record<string, string> = {};
  for (let i = 0; i < dataContainer.numColumns(); i++) {
    const field = dataContainer.getField?.(i);
    if (field) {
      columns[field.name] = field.type;
    }
  }

  return {
    type: 'metadata',
    name: 'metadata',
    result: {
      datasetName,
      datasetId,
      columns
    }
  };
}
