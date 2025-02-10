import {ReactNode, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {DuckDB} from '@/hooks/use-duckdb';
import {CreateVariableCallbackOutput} from '@/ai/assistant/callbacks/callback-table';
import {addKeplerColumn, generateSQLUpdateColumn} from '@/utils/table-utils';
import {PreviewDataTable} from '../table/preview-data-table';
import {CustomCreateButton} from '../common/custom-create-button';
import {selectKeplerDataset} from '@/store/selectors';
import {addTableColumn} from '@kepler.gl/actions';
import {CustomFunctionCall, CustomFunctionOutputProps} from '@openassistant/core';

export function customCreateVariableMessageCallback({
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  if (isCustomCreateVariableOutput(output)) {
    return <CustomCreateVariableMessage functionOutput={output} functionArgs={functionArgs} />;
  }
  return null;
}

export function isCustomCreateVariableOutput(
  functionOutput: CustomFunctionOutputProps<unknown, unknown>
): functionOutput is CreateVariableCallbackOutput {
  return functionOutput.type === 'create-variable';
}

/**
 * Custom Create Variable Message
 */
export const CustomCreateVariableMessage = ({
  functionOutput
}: {
  functionOutput: CreateVariableCallbackOutput;
  functionArgs: Record<string, any>;
}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);

  const {newColumn, columnType, values, datasetName, datasetId} = functionOutput.data || {};

  // get dataset from redux store
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const sql = useMemo(
    () =>
      datasetName && newColumn && columnType
        ? generateSQLUpdateColumn({
            tableName: datasetName,
            columnName: newColumn,
            columnType: columnType,
            values: values
          })
        : '',
    [columnType, datasetName, newColumn, values]
  );

  if (!functionOutput.data || !newColumn || !columnType || !values) {
    return null;
  }

  // handle click event
  const onClick = () => {
    if (datasetId) {
      // add column to duckdb
      DuckDB.getInstance().addColumnBySQL(sql);
      // add column to kepler.gl
      const {newField, values: columnValues} = addKeplerColumn({
        dataset: keplerDataset,
        newFieldName: newColumn,
        fieldType: columnType,
        columnData: values
      });
      dispatch(addTableColumn(datasetId, newField, columnValues));

      // hide the button once clicked
      setHide(true);
    }
  };

  return keplerDataset ? (
    <div className="mt-4 w-full">
      {!hide && (
        <div className="w-full">
          <PreviewDataTable
            fieldName={newColumn}
            fieldType={columnType}
            columnData={values}
            numberOfRows={keplerDataset.length}
          />
        </div>
      )}
      <CustomCreateButton onClick={onClick} hide={hide} label="Click to Add This Column" />
    </div>
  ) : null;
};
