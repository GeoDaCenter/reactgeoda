import React from 'react';
import {useTable} from 'react-table';
import {FormattedMessage} from 'react-intl';
import {useSelector} from 'react-redux';

import {GeoDaState} from '../store';

const ReactTable = () => {
  // Prepare data for the table
  const data = useSelector((state: GeoDaState) => state.root.file.fileData);

  const memoData = React.useMemo(() => (data && data.rows ? data.rows : []), [data]);
  const memoColumns = React.useMemo(
    () =>
      data && data.fields
        ? data.fields.map((field, index) => ({
            Header: field.name,
            accessor: (row: any[]) =>
              typeof row[index] === 'object' ? JSON.stringify(row[index]) : row[index] // stringify the object if it's an object
          }))
        : [],
    [data]
  );

  // Create an instance of the table
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns: memoColumns,
    data: memoData
  });

  // Check if data is available
  if (!data || !data.fields || !data.rows || data.fields.length === 0 || data.rows.length === 0) {
    return (
      <p>
        <FormattedMessage id="table.noData" defaultMessage="No data available" />
      </p>
    );
  }

  // Render the UI
  return (
    <table {...getTableProps()} style={{width: '100%'}}>
      <thead>
        {headerGroups.map((headerGroup, i) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={i}>
            {headerGroup.headers.map((column, j) => (
              <th {...column.getHeaderProps()} key={j}>
                {column.render('Header') as React.ReactNode}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row, k) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={k}>
              {row.cells.map((cell, l) => (
                <td {...cell.getCellProps()} key={l}>
                  {cell.render('Cell') as React.ReactNode}
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReactTable;
