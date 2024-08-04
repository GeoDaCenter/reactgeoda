import React from 'react';
import dynamic from 'next/dynamic';
import {useDispatch, useSelector} from 'react-redux';
import {Icon} from '@iconify/react';
import {GeoDaState} from '../../store';
import {DEFAULT_TABLE_HEIGHT} from '@/constants';
import {Splitter} from '../common/splitter';
import {mainTableNameSelector} from '@/store/selectors';
import {setKeplerTableModal} from '@/actions';

const DuckDBTable = dynamic(() => import('./duckdb-table'), {ssr: false});

export const TableContainer = () => {
  const dispatch = useDispatch();

  const [tableHeight, setTableHeight] = React.useState<number>(DEFAULT_TABLE_HEIGHT);

  // get showGridView from redux state
  const showTable = useSelector((state: GeoDaState) => state.root.uiState.showKeplerTable);

  // get table name
  const tableName = useSelector(mainTableNameSelector);

  const onCloseTableClicked = () => {
    dispatch(setKeplerTableModal(false));
  };

  return showTable && tableName ? (
    <div className="relative flex-grow-0 p-0" style={{height: tableHeight}}>
      <Splitter
        mode="vertical"
        initialSize={tableHeight}
        onSplitterChange={setTableHeight}
        minimumSize={100}
      />
      <div
        className="absolute right-1 top-0 z-[101] m-2 cursor-pointer"
        onClick={onCloseTableClicked}
      >
        <Icon icon="material-symbols:close" width={12} color="black" />
      </div>
      <DuckDBTable />
    </div>
  ) : null;
};
