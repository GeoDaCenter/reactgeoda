import React, {useCallback, useMemo, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Table as ArrowTable, Field as ArrowField} from 'apache-arrow';
// @ts-ignore
import {DATA_TYPES as AnalyzerDATA_TYPES} from 'type-analyzer';
import {
  appInjector,
  DatasetTabs,
  DataTableFactory,
  makeGetActionCreators,
  renderedSize
} from '@kepler.gl/components';
import {ProcessorResult, Field} from '@kepler.gl/types';
import {arrowDataTypeToFieldType, arrowDataTypeToAnalyzerDataType} from '@kepler.gl/utils';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';

import {GeoDaState} from '../../store';
import {useTheme} from 'styled-components';
import {
  defaultDatasetIdSelector,
  keplerDatasetsSelector,
  selectKeplerDataset
} from '@/store/selectors';
import {wrapTo} from '@kepler.gl/actions';
import {MAP_ID} from '@/constants';

export const MIN_STATS_CELL_SIZE = 122;

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

  const defaultDatasetId = useSelector(defaultDatasetIdSelector);
  const [activeKeplerDatasetId, setActiveKeplerDatasetId] = useState<string>(
    defaultDatasetId || ''
  );

  // get Kepler state from redux store
  const keplerDatasets = useSelector(keplerDatasetsSelector);
  const keplerDataset = useSelector(selectKeplerDataset(activeKeplerDatasetId));

  const {fields, dataContainer, pinnedColumns, label: tableName, id: dataId} = keplerDataset;

  // get filteredIndex from redux
  const filteredIndex = useSelector(
    (state: GeoDaState) => state.root.interaction?.brushLink?.[dataId]
  );

  const filteredIndexDict = useMemo(() => {
    const dict: {[key: number]: boolean} = {};
    filteredIndex?.forEach((i: number) => {
      dict[i] = true;
    });
    return dict;
  }, [filteredIndex]);

  const columns = useMemo(() => fields.map((f: Field) => f.name), [fields]);

  const colMeta = useMemo(
    () =>
      fields.reduce(
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
      ),
    [fields]
  );

  const cellSizeCache = useMemo(
    () =>
      fields.reduce(
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
      ),
    [fields, dataContainer, theme.cellFontSize, theme.fontFamily]
  );

  // get action creators from kepler.gl
  // const {visStateActions} = useMemo(() => keplerActionSelector(dispatch, {}), [dispatch]);
  // get kepler actions
  const dispatchKepler = (action: any) => dispatch(wrapTo(MAP_ID, action));
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions} = keplerActionSelector(dispatchKepler, keplerOwnProps);

  const onShowDatasetTable = useCallback((datasetId: string) => {
    setActiveKeplerDatasetId(datasetId);
  }, []);

  return useMemo(
    () => (
      <div
        className="item-center flex w-full flex-col bg-white"
        style={{height: '100%', minWidth: '50vw', padding: '0px'}}
      >
        <DatasetTabs
          activeDataset={keplerDataset}
          datasets={keplerDatasets}
          showDatasetTable={onShowDatasetTable}
        />
        <DataTable
          key={tableName}
          dataId={tableName}
          columns={columns}
          colMeta={colMeta}
          cellSizeCache={cellSizeCache}
          dataContainer={dataContainer}
          filteredIndex={filteredIndexDict}
          pinnedColumns={pinnedColumns}
          sortColumn={{}}
          sortTableColumn={visStateActions.sortTableColumn}
          pinTableColumn={visStateActions.pinTableColumn}
          copyTableColumn={visStateActions.copyTableColumn}
          setColumnDisplayFormat={visStateActions.setColumnDisplayFormat}
          theme={theme}
        />
      </div>
    ),
    [
      cellSizeCache,
      colMeta,
      columns,
      dataContainer,
      filteredIndexDict,
      keplerDataset,
      keplerDatasets,
      onShowDatasetTable,
      pinnedColumns,
      tableName,
      theme,
      visStateActions.copyTableColumn,
      visStateActions.pinTableColumn,
      visStateActions.setColumnDisplayFormat,
      visStateActions.sortTableColumn
    ]
  );
}

export default DuckDBTableComponent;
