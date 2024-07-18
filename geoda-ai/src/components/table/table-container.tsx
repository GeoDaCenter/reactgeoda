import React from 'react';
import dynamic from 'next/dynamic';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {DEFAULT_TABLE_HEIGHT} from '@/constants';
import {Splitter} from '../common/splitter';
import {mainTableNameSelector} from '@/store/selectors';

const DuckDBTable = dynamic(() => import('./duckdb-table'), {ssr: false});

export const TableContainer = () => {
  const [tableHeight, setTableHeight] = React.useState<number>(DEFAULT_TABLE_HEIGHT);

  // get showGridView from redux state
  const showTable = useSelector((state: GeoDaState) => state.root.uiState.showKeplerTableModal);

  // get table name
  const tableName = useSelector(mainTableNameSelector);

  return showTable && tableName ? (
    <div className="relative flex-grow-0 p-0" style={{height: tableHeight}}>
      <Splitter
        mode="vertical"
        initialSize={tableHeight}
        onSplitterChange={setTableHeight}
        minimumSize={100}
      />
      <DuckDBTable />
    </div>
  ) : null;
};
