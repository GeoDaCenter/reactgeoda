import React from "react";
import { useTable } from "react-table";
import { FormattedMessage } from "react-intl";

const ReactTable = ({ data }) => {
  // Check if data is available
  if (!data || !data.fields || !data.rows || data.fields.length === 0 || data.rows.length === 0) {
    return (
      <p>
        <FormattedMessage
          id="table.noData"
          defaultMessage="No data available"
        />
      </p>
    );
  }

  // Memoize data to avoid excessive re-renders
  const memoData = React.useMemo(() => data.rows, [data.rows]);
  const memoColumns = React.useMemo(() => 
    data.fields.map((field, index) => ({
      Header: field.name,
      accessor: row => typeof row[index] === "object" ? JSON.stringify(row[index]) : row[index] // stringify the object if it's an object
    })),
    [data.fields]
  );

  // Create an instance of the table
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns: memoColumns, data: memoData });

  // Render the UI
  return (
    <table {...getTableProps()} style={{ width: "100%" }}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => (
                <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReactTable;
