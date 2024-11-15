import {median} from 'd3-array';

export function generateNewColumnName(
  variableName: string,
  operation: string,
  existingVariables: Array<{variableName: string; variableType: string}>
): string {
  const newName = `${operation}_${variableName}`;
  return existingVariables.some(variable => variable.variableName === newName)
    ? `${newName}_1`
    : newName;
}

export function applyOperation(
  joinResult: number[][],
  values: number[],
  operation: string
): number[] {
  switch (operation) {
    case 'count':
      return joinResult.map(row => row.length);
    case 'sum':
      return joinResult.map(row => row.reduce((acc, curr) => acc + curr, 0));
    case 'mean':
      return joinResult.map(row => row.reduce((acc, curr) => acc + curr, 0) / row.length);
    case 'min':
      return joinResult.map(row => Math.min(...row));
    case 'max':
      return joinResult.map(row => Math.max(...row));
    case 'median':
      return joinResult.map(row => median(row) || 0);
    case 'unique':
      return joinResult.map(row => new Set(row).size);
    default:
      return values;
  }
}
