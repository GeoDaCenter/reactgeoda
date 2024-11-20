import {generateNewColumnName} from '@/utils/join-table-utils';
import {
  Checkbox,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@nextui-org/react';
import React, {useState, useEffect, ChangeEvent, KeyboardEvent} from 'react';
import {FieldTypeIndicator} from '../common/field-type-indicator';
import {AssignVariable} from '@/actions/spatial-join-actions';

const COLUMNS = [
  {key: 'variable', label: 'Variable'},
  {key: 'newVariableName', label: 'New Name'},
  {key: 'selected', label: ''}
];

type CandidateVariable = {
  variableName: string;
  variableType: string;
  newVariableName: string;
  selected: boolean;
};

type AssignTableProps = {
  originalVariables: Array<{variableName: string; variableType: string}>;
  assignVariables: Array<{variableName: string; variableType: string}>;
  onVariablesUpdated: (variables: AssignVariable[]) => void;
};

export function AssignTable({
  originalVariables,
  assignVariables,
  onVariablesUpdated
}: AssignTableProps) {
  // Add useEffect to update candidateVariables when assignVariables change
  const [candidateVariables, setCandidateVariables] = useState<CandidateVariable[]>([]);

  useEffect(() => {
    if (!assignVariables?.length) return;

    const initialCandidates = assignVariables.map(variable => ({
      variableName: variable.variableName,
      variableType: variable.variableType,
      newVariableName: generateNewColumnName(variable.variableName, '', originalVariables),
      selected: false
    }));

    setCandidateVariables(initialCandidates);
  }, [assignVariables, originalVariables]);

  // Return early if no assign variables
  if (!assignVariables?.length) {
    return null;
  }

  const onRowSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const variableName = e.target.value;
    const isSelected = e.target.checked;
    const updatedCandidateVariables = candidateVariables.map(v =>
      v.variableName === variableName ? {...v, selected: isSelected} : v
    );
    setCandidateVariables(updatedCandidateVariables);
    onVariablesUpdated(updatedCandidateVariables.filter(v => v.selected));
  };

  const onNewVariableNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const variableName = e.target.id;
    const newVariableName = e.target.value;
    const updatedCandidateVariables = candidateVariables.map(v =>
      v.variableName === variableName ? {...v, newVariableName} : v
    );
    setCandidateVariables(updatedCandidateVariables);
    onVariablesUpdated(updatedCandidateVariables.filter(v => v.selected));
  };

  const onTableKeyDown = (e: KeyboardEvent<HTMLTableSectionElement>) => {
    // Prevent all keyboard navigation events on the table
    e.preventDefault();
    e.stopPropagation();
  };

  const onTableRowKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    // Prevent all keyboard navigation events on the table row
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Table
      aria-label="Assign Table"
      className="m-0 w-full p-0"
      classNames={{
        base: 'max-h-[320px] overflow-scroll p-0 m-0',
        table: 'p-0 m-0',
        wrapper: 'p-0 pr-2'
      }}
      isCompact={true}
      radius="none"
      disabledBehavior="all"
      removeWrapper={true}
    >
      <TableHeader columns={COLUMNS}>
        {column => <TableColumn key={column.key}>{column.label}</TableColumn>}
      </TableHeader>
      <TableBody items={candidateVariables} onKeyDown={onTableKeyDown}>
        {item => (
          <TableRow key={item.variableName} onKeyDown={onTableRowKeyDown}>
            {columnKey => {
              if (columnKey === 'variable') {
                return (
                  <TableCell>
                    <Tooltip content={item.variableName}>
                      <div className="flex max-w-[80px] flex-row gap-1 truncate text-xs">
                        <FieldTypeIndicator variableType={item.variableType} />
                        <span>{item.variableName}</span>
                      </div>
                    </Tooltip>
                  </TableCell>
                );
              } else if (columnKey === 'newVariableName') {
                return (
                  <TableCell>
                    <Input
                      id={item.variableName}
                      value={item.newVariableName}
                      onChange={onNewVariableNameChange}
                      size="sm"
                      variant="underlined"
                      className="max-w-[100px] truncate"
                    />
                  </TableCell>
                );
              } else if (columnKey === 'selected') {
                return (
                  <TableCell>
                    <Checkbox
                      className="w-2"
                      size="sm"
                      isSelected={
                        candidateVariables.find(v => v.variableName === item.variableName)?.selected
                      }
                      onChange={onRowSelected}
                      value={item.variableName}
                    />
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
