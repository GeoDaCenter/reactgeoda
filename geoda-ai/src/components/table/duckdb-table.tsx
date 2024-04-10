import React, {useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Table as ArrowTable, Field as ArrowField} from 'apache-arrow';
// @ts-ignore
import {DATA_TYPES as AnalyzerDATA_TYPES} from 'type-analyzer';

// @ts-ignore FIXME
import {
  appInjector,
  DataTableFactory,
  makeGetActionCreators,
  renderedSize
} from '@kepler.gl/components';
import {ProcessorResult, Field} from '@kepler.gl/types';
import {arrowDataTypeToFieldType, arrowDataTypeToAnalyzerDataType} from '@kepler.gl/utils';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';

import {GeoDaState} from '../../store';
import {useTheme} from 'styled-components';
import {getDataset} from '@/utils/data-utils';

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

  const dataId = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  // get Kepler state from redux store
  const dataset = useSelector((state: GeoDaState) => getDataset(state));

  // @ts-expect-error FIXME
  const {fields, dataContainer, pinnedColumns, filteredIndex} = dataset;

  const filteredIndexDict = useMemo(() => {
    const dict: {[key: number]: boolean} = {};
    filteredIndex.forEach((i: number) => {
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
  const {visStateActions} = keplerActionSelector(dispatch, {});

  return (
    <div
      className="item-center flex w-full flex-col bg-white p-5"
      style={{height: '100%', minWidth: '50vw', padding: '20px'}}
    >
      <DataTable
        key={dataId}
        dataId={dataId}
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
  );
}

export default DuckDBTableComponent;
