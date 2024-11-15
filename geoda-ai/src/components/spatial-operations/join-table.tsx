import {generateNewColumnName} from '@/utils/join-table-utils';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Select,
  SelectItem,
  Checkbox,
  SharedSelection,
  Tooltip
} from '@nextui-org/react';
import {FieldTypeIndicator} from '../common/field-type-indicator';
import {ChangeEvent, useState, useEffect} from 'react';

const COLUMNS = [
  {key: 'variable', label: 'Variable'},
  {key: 'operations', label: 'Operation'},
  {key: 'selected', label: ''}
];

const NUMERIC_OPERATIONS = ['count', 'sum', 'mean', 'min', 'max', 'median', 'unique'];

const STRING_OPERATIONS = ['count', 'unique'];

export type JoinTableProps = {
  joinVariables: Array<{variableName: string; variableType: string}>;
  onVariablesUpdated: (
    variables: Array<{variableName: string; operation: string; newVariableName: string}>
  ) => void;
};

/**
 * Join Table component is a table that displays the join operations for the spatial operations
 * of the selected variables.
 *
 * The join operations includes:
 * - count
 * - sum
 * - mean
 * - min
 * - max
 * - median
 * - unique
 *
 * Each row of the table represents a join operation for a selected variable.
 * There is a checkbox in the first column of the table to select the variable.
 *
 * The user selections
 * @returns React component
 */
export function JoinTable({joinVariables, onVariablesUpdated}: JoinTableProps) {
  // Add useEffect to update candidateVariables when joinVariables changes
  const [candidateVariables, setCandidateVariables] = useState<
    Array<{
      variableName: string;
      operation: string;
      newVariableName: string;
      selected: boolean;
    }>
  >([]);

  useEffect(() => {
    if (!joinVariables?.length) return;

    const initialCandidates = joinVariables.map(variable => ({
      variableName: variable.variableName,
      operation: '',
      newVariableName: generateNewColumnName(variable.variableName, '', joinVariables),
      selected: false
    }));

    console.log('Setting initialCandidates:', initialCandidates);
    setCandidateVariables(initialCandidates);
  }, [joinVariables]);

  // Return early if no join variables
  if (!joinVariables?.length) {
    return null;
  }

  const items = joinVariables.map((variable, index) => ({
    key: index,
    variable: variable.variableName,
    variableType: variable.variableType,
    operations:
      variable.variableType === 'number' ||
      variable.variableType === 'integer' ||
      variable.variableType === 'float'
        ? NUMERIC_OPERATIONS
        : STRING_OPERATIONS
  }));

  const updateJoinOperation = (variableName: string, operation: string) => {
    const updatedCandidateVariables = candidateVariables.map(v =>
      v.variableName === variableName
        ? {
            ...v,
            operation,
            newVariableName: generateNewColumnName(variableName, operation, joinVariables),
            selected: true
          }
        : v
    );
    setCandidateVariables(updatedCandidateVariables);
    onVariablesUpdated(updatedCandidateVariables.filter(v => v.selected));
  };

  const onRowSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const variableName = e.target.value;
    const isSelected = e.target.checked;
    const updatedCandidateVariables = candidateVariables.map(v =>
      v.variableName === variableName ? {...v, selected: isSelected} : v
    );
    setCandidateVariables(updatedCandidateVariables);
    onVariablesUpdated(updatedCandidateVariables.filter(v => v.selected));
  };

  return (
    <Table
      aria-label="Join Table"
      className="m-0 w-full p-0"
      classNames={{
        base: 'max-h-[320px] overflow-scroll p-0 m-0',
        table: 'p-0 m-0',
        wrapper: 'p-0 pr-2'
      }}
      isCompact={true}
      radius="none"
    >
      <TableHeader columns={COLUMNS}>
        {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={items}>
        {item => (
          <TableRow key={item.key}>
            {columnKey => {
              if (columnKey === 'variable') {
                return (
                  <TableCell>
                    <Tooltip content={item.variable}>
                      <div className="flex max-w-[80px] flex-row gap-1 truncate text-xs">
                        <FieldTypeIndicator variableType={item.variableType} />
                        <span>{item.variable}</span>
                      </div>
                    </Tooltip>
                  </TableCell>
                );
              } else if (columnKey === 'operations') {
                return (
                  <TableCell>
                    <OperationCell
                      variableName={item.variable}
                      operations={item.operations}
                      updateJoinOperation={updateJoinOperation}
                    />
                  </TableCell>
                );
              } else if (columnKey === 'selected') {
                return (
                  <TableCell>
                    {
                      <Checkbox
                        className="w-2"
                        size="sm"
                        isSelected={
                          candidateVariables.find(v => v.variableName === item.variable)?.selected
                        }
                        onChange={onRowSelected}
                        value={item.variable}
                      />
                    }
                  </TableCell>
                );
              }
              return <></>;
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

/**
 * OperationCell component is a cell that displays a selector with all the operations for a join operation.
 * @returns React component
 */
export function OperationCell({
  variableName,
  operations,
  updateJoinOperation
}: {
  variableName: string;
  operations: string[];
  updateJoinOperation: (variableName: string, operation: string) => void;
}) {
  const onSelectionChange = (keys: SharedSelection) => {
    const operation = keys.currentKey;
    if (operation) {
      // update the operation for the selected variable
      updateJoinOperation(variableName, operation);
    }
  };

  return (
    <Select
      size="sm"
      className="w-20 text-[0.5rem]"
      aria-label="Select join operation"
      onSelectionChange={onSelectionChange}
      variant="flat"
      radius="none"
    >
      {operations.map(op => (
        <SelectItem key={op} value={op}>
          {op}
        </SelectItem>
      ))}
    </Select>
  );
}
