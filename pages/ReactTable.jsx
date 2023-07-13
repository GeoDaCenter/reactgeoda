import React from 'react';
import { useTable } from 'react-table';

const ReactTable = ({ data }) => {
  // Check if data is available
  if (!data || data.length === 0) return <p>No data available</p>;

  // Prepare columns from data keys
  const columns = Object.keys(data[0]).map(key => ({ Header: key, accessor: key }));

  // Create an instance of the table
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data });

  // Render the UI for your table
  return (
    <table {...getTableProps()} style={{ width: '100%' }}>
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th {...column.getHeaderProps()}>{column.render('Header')}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => (
                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReactTable;
