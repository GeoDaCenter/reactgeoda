import {useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {useDuckDB} from '@/hooks/use-duckdb';
import {CreateVariableCallBackOutput} from '@/ai/assistant/callbacks/callback-table';
import {addKeplerColumn, generateSQLUpdateColumn} from '@/utils/table-utils';
import {GeoDaState} from '@/store';
import {getDataset} from '@/utils/data-utils';
import {PreviewDataTable} from '../table/preview-data-table';
import {CustomCreateButton} from '../common/custom-create-button';
import {CustomMessagePayload} from './custom-messages';
import {mainTableNameSelector} from '@/store/selectors';
import {addTableColumn} from '@kepler.gl/actions';

/**
 * Custom Create Variable Message
 */
export const CustomCreateVariableMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const createVariableData =
    'data' in props.output && (props.output.data as CreateVariableCallBackOutput['data']);
  const dispatch = useDispatch();
  const {addColumn} = useDuckDB();

  const tableName = useSelector(mainTableNameSelector);
  const dataset = useSelector((state: GeoDaState) => getDataset(state));
  const numberOfRows = dataset?.dataContainer.numRows() || 0;

  const sql = useMemo(() => {
    return createVariableData
      ? generateSQLUpdateColumn({
          tableName,
          columnName: createVariableData.newColumn,
          columnType: createVariableData.columnType,
          values: createVariableData.values
        })
      : '';
  }, [createVariableData, tableName]);

  // handle click event
  const onClick = () => {
    if (createVariableData && dataset) {
      // add column to duckdb
      addColumn(sql);
      // add column to kepler.gl
      const {newField, values} = addKeplerColumn({
        dataset,
        newFieldName: createVariableData.newColumn,
        fieldType: createVariableData.columnType,
        columnData: createVariableData.values
      });
      dispatch(addTableColumn(dataset.id, newField, values));

      // hide the button once clicked
      setHide(true);
    }
  };

  return createVariableData ? (
    <div className="w-full">
      {!hide && (
        <div className="w-full">
          <PreviewDataTable
            fieldName={createVariableData.newColumn}
            fieldType={createVariableData.columnType}
            columnData={createVariableData.values}
            numberOfRows={numberOfRows}
          />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Column" />
    </div>
  ) : null;
};
