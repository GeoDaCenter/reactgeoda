import {Table as ArrowTable} from 'apache-arrow';

export function getColumnDataFromArrowTable({
  arrowTable,
  columnName
}: {
  arrowTable: ArrowTable;
  columnName: string;
}): number[] {
  const column = arrowTable.getChild(columnName);
  if (!column) {
    throw new Error(`Column "${columnName}" not found in table`);
  }
  // Convert array elements to numbers
  return Array.from(column.toArray());
}
