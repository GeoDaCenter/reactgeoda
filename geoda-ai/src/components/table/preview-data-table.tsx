import {appInjector, DataTableFactory, renderedSize} from '@kepler.gl/components';
import {Field} from '@kepler.gl/types';
import {useTheme} from 'styled-components';
import {MIN_STATS_CELL_SIZE} from './duckdb-table';
import KeplerTable from '@kepler.gl/table';
import {useMemo} from 'react';
import {fieldTypeToAnalyzerType} from '@/utils/table-utils';

// get DataTableModal component from appInjector
const DataTable = appInjector.get(DataTableFactory);

export function PreviewDataTable({
  fieldName,
  fieldType,
  columnData,
  numberOfRows
}: {
  fieldName: string;
  fieldType: string;
  columnData: unknown | unknown[];
  numberOfRows: number;
}) {
  const dataId = 'preview-data';
  const theme = useTheme();

  const analyzerType = fieldTypeToAnalyzerType(fieldType);

  const rows = useMemo(() => {
    const data: any[][] = [];
    // convert columnData to rows
    if (Array.isArray(columnData) && columnData.length > 0) {
      columnData.forEach(val => {
        data.push([val]);
      });
    } else {
      for (let i = 0; i < numberOfRows; ++i) {
        data.push([Array.isArray(columnData) ? null : columnData]);
      }
    }
    return data;
  }, [columnData, numberOfRows]);

  const fields: Field[] = useMemo(
    () => [
      {
        name: fieldName,
        type: fieldType,
        format: '',
        displayName: fieldName,
        fieldIdx: 0,
        analyzerType,
        valueAccessor: (d: any) => d[0]
      }
    ],
    [fieldName, fieldType, analyzerType]
  );

  const columns = useMemo(() => fields.map((f: Field) => f.name), [fields]);

  const dataContainer = useMemo(() => {
    const data = {fields, rows};
    // create a data container with a single column
    const keplerTable = new KeplerTable({info: {id: dataId}, data, color: [0, 0, 0]});
    const dataContainer = keplerTable.dataContainer;
    return dataContainer;
  }, [fields, rows]);

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

  return (
    <div className="item-center flex h-80 w-full flex-col  bg-white dark:bg-black">
      <DataTable
        key={dataId}
        dataId={dataId}
        columns={columns}
        colMeta={colMeta}
        cellSizeCache={cellSizeCache}
        dataContainer={dataContainer}
        // filteredIndex={filteredIndexDict}
        // pinnedColumns={pinnedColumns}
        sortColumn={{}}
        // sortTableColumn={visStateActions.sortTableColumn}
        // pinTableColumn={visStateActions.pinTableColumn}
        // copyTableColumn={visStateActions.copyTableColumn}
        // setColumnDisplayFormat={visStateActions.setColumnDisplayFormat}
        theme={theme}
      />
    </div>
  );
}
