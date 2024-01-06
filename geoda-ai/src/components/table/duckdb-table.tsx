import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Table as ArrowTable, Field as ArrowField} from 'apache-arrow';
// @ts-ignore
import {DATA_TYPES as AnalyzerDATA_TYPES} from 'type-analyzer';
import MonacoEditor from '@monaco-editor/react';

// @ts-ignore FIXME
import {
  appInjector,
  DataTableFactory,
  DataTableProps,
  makeGetActionCreators,
  renderedSize
} from '@kepler.gl/components';
import {ProcessorResult, Field} from '@kepler.gl/types';
import {theme, themeLT} from '@kepler.gl/styles';
import {arrowDataTypeToFieldType, arrowDataTypeToAnalyzerDataType} from '@kepler.gl/utils';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';

import {GeoDaState} from '../../store';
import {useDuckDB} from '../../hooks/use-duckdb';
import {ThemeProvider, useTheme, withTheme} from 'styled-components';

const MIN_STATS_CELL_SIZE = 122;

// create a selector to get the action creators from kepler.gl
const keplerActionSelector = makeGetActionCreators();

  // get DataTableModal component from appInjector
const DataTable = appInjector.get(DataTableFactory);

export function processArrowTable(arrowTable: ArrowTable): ProcessorResult | null {
  const fields: Field[] = [];

  // parse fields
  arrowTable.schema.fields.forEach((field: ArrowField, index: number) => {
    const isGeometryColumn = field.metadata.get('ARROW:extension:name')?.startsWith('geoarrow');
    fields.push({
      name: field.name,
      id: field.name,
      displayName: field.name,
      format: '',
      fieldIdx: index,
      type: isGeometryColumn ? ALL_FIELD_TYPES.geoarrow : arrowDataTypeToFieldType(field.type),
      analyzerType: isGeometryColumn
        ? AnalyzerDATA_TYPES.GEOMETRY
        : arrowDataTypeToAnalyzerDataType(field.type),
      valueAccessor: (dc: any) => (d: {index: any}) => {
        return dc.valueAt(d.index, index);
      },
      metadata: field.metadata
    });
  });

  const cols = [...Array(arrowTable.numCols).keys()].map(i => arrowTable.getChildAt(i));
  // return empty rows and use raw arrow table to construct column-wise data container
  return {fields, rows: [], cols, metadata: arrowTable.schema.metadata};
}

export function DuckDBTableComponent() {
  const dispatch = useDispatch();
  const theme = useTheme();

  // set state for monaco editor
  const [code, setCode] = useState('');

  // get GeoDa state from redux store
  const geoda = useSelector((state: GeoDaState) => state.root);

  // use current file name as the name of the table
  const tableName = geoda.file.rawFileData.name;

  // get Kepler state from redux store
  const kepler = useSelector((state: GeoDaState) => state.keplerGl['kepler_map']);

  // get dataset, TODO only one dataset is supported now
  const dataset = Object.values(kepler.visState.datasets)[0];
  const dataId = Object.keys(kepler.visState.datasets)[0];

  // @ts-expect-error
  const {fields, dataContainer, pinnedColumns} = dataset;

  const columns = fields.map((f: Field) => f.name);

  const colMeta = fields.reduce(
    (acc: Object, {name, displayName, type, filterProps, format, displayFormat}: Field) => ({
      ...acc,
      [name]: {
        name: displayName || name,
        type,
        ...(format ? {format} : {}),
        ...(displayFormat ? {displayFormat} : {}),
        ...(filterProps?.columnStats ? {columnStats: filterProps.columnStats} : {})
      }
    }),
    {}
  );

  const cellSizeCache = fields.reduce(
    (acc: Object, field: Field, colIdx: number) => ({
      ...acc,
      [field.name]: renderedSize({
        text: {
          dataContainer,
          column: field.displayName
        },
        colIdx,
        type: field.type,
        fontSize: theme.cellFontSize,
        font: theme.fontFamily,
        minCellSize: MIN_STATS_CELL_SIZE
      })
    }),
    {}
  );

  // get action creators from kepler.gl
  const {visStateActions, uiStateActions} = keplerActionSelector(dispatch, {});

  // get duckdb hook
  const {query, importArrowFile} = useDuckDB();

  // write callback function onQueryClick
  const onQueryClick = async () => {
    const selectedIndexes = await query(code);
    console.log('query result', selectedIndexes);

    if (selectedIndexes) {
      // dispatch action SET_FILTER_INDEXES to update filtered indexes in kepler
      dispatch({
        type: 'SET_FILTER_INDEXES',
        payload: {dataLabel: tableName, filteredIndex: selectedIndexes}
      });
      // const newData = processArrowTable(result);
      // const updatedDataset: ProtoDataset = {
      //   // @ts-expect-error FIXME
      //   data: newData,
      //   info: {
      //     id: generateHashIdFromString(tableName),
      //     label: tableName,
      //     format: 'arrow'
      //   }
      // };
      // // dispatch action to update dataset in kepler
      // dispatch(updateVisData([updatedDataset], {keepExistingConfig: true}));
      // const keplerTable = datasets[info.id];
      // // update the data in keplerTable
      // keplerTable.update(validatedData);
    }
  };

  const onMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
    // console.log('ev', ev);
  };

  useEffect(() => {
    console.log('useEffect importArrowFile');
    importArrowFile(geoda.file.rawFileData);
    setCode(`select * from "${tableName}" LIMIT 5`);
  }, [geoda.file.rawFileData, importArrowFile, tableName]);

  return (
    <div
      className="item-center flex w-full flex-col p-5"
      style={{height: '100%', minWidth: '50vw', padding: '20px'}}
    >
      <div className="flex w-full basis-1/4 flex-col items-center justify-center">
        <div className="h-20 w-full rounded border-2 border-solid border-rose-800 p-1">
          <MonacoEditor
            language="sql"
            value={code}
            onChange={onMonacoEditorChange}
            options={{
              minimap: {enabled: false}
            }}
          />
        </div>
        <div className="m-2 flex w-full flex-row items-start space-x-4">
          <button
            onClick={onQueryClick}
            className="inline-flex items-center rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400"
          >
            Query
          </button>
          <button className="inline-flex items-center rounded bg-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-400">
            Reset
          </button>
        </div>
      </div>
      <DataTable
        key={dataId}
        dataId={dataId}
        columns={columns}
        colMeta={colMeta}
        cellSizeCache={cellSizeCache}
        dataContainer={dataContainer}
        pinnedColumns={pinnedColumns}
        sortColumn={{}}
        sortTableColumn={visStateActions.sortTableColumn}
        pinTableColumn={visStateActions.pinTableColumn}
        copyTableColumn={visStateActions.copyTableColumn}
        setColumnDisplayFormat={visStateActions.setColumnDisplayFormat}
        theme={theme}
      />
    </div>
  );
}

export default DuckDBTableComponent;
