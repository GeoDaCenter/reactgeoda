import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useMemo, useState} from 'react';

import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {useDispatch, useSelector} from 'react-redux';
import {GreenCheckIcon} from '../icons/green-check';
import {useDuckDB} from '@/hooks/use-duckdb';
import {
  addKeplerColumn,
  generateSQLUpdateColumn,
  CreateVariableCallBackOutput
} from '@/utils/table-utils';
import {GeoDaState} from '@/store';
import {getDataset} from '@/utils/data-utils';
import {PreviewDataTable} from '../table/preview-data-table';

/**
 * Custom Create Variable Message
 */
export const CustomCreateVariableMessage = ({props}: {props: CustomMessagePayload}) => {
  const [hide, setHide] = useState(false);
  const createVariableData = props.output.data as CreateVariableCallBackOutput['data'];
  const dispatch = useDispatch();
  const {addColumn} = useDuckDB();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  const dataset = useSelector((state: GeoDaState) => getDataset(state));
  const numberOfRows = dataset?.dataContainer.numRows() || 0;

  const sql = useMemo(() => {
    return generateSQLUpdateColumn({
      tableName,
      columnName: createVariableData.newColumn,
      columnType: createVariableData.columnType,
      values: createVariableData.values
    });
  }, [createVariableData, tableName]);

  // handle click event
  const onClick = () => {
    // add column to duckdb
    addColumn(sql);
    // add column to kepler.gl
    addKeplerColumn({
      dataset,
      newFieldName: createVariableData.newColumn,
      fieldType: createVariableData.columnType,
      columnData: createVariableData.values,
      dispatch
    });

    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <PreviewDataTable
          fieldName={createVariableData.newColumn}
          fieldType={createVariableData.columnType}
          columnData={createVariableData.values}
          numberOfRows={numberOfRows}
        />
      </div>
      <Button
        radius="full"
        className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
        onClick={onClick}
        startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
        isDisabled={hide}
      >
        <Typewriter
          options={{
            strings: `Click to Add This Column`,
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
