import React from 'react';

function getLabelAndColor(variableType: string) {
  switch (variableType.toLowerCase()) {
    case 'string':
      return {label: 'Str', color: 'bg-green-100 dark:bg-green-500'};
    case 'number':
    case 'integer':
    case 'float':
      return {label: 'Num', color: 'bg-primary-100 dark:bg-primary-200'};
    case 'boolean':
      return {label: 'Bool', color: 'bg-success-100 dark:bg-success-200'};
    case 'date':
      return {label: 'Date', color: 'bg-warning-100 dark:bg-warning-200'};
    case 'array':
      return {label: 'Arr', color: 'bg-secondary-100 dark:bg-secondary-200'};
    case 'object':
      return {label: 'Obj', color: 'bg-danger-100 dark:bg-danger-200'};
    default:
      return {label: variableType.substring(0, 3), color: 'bg-default-100 dark:bg-default-200'};
  }
}

export function FieldTypeIndicator({variableType}: {variableType: string}) {
  const {label, color} = getLabelAndColor(variableType);

  return (
    <div
      className={`h-5 w-5 min-w-5 max-w-5 rounded-sm ${color} justify-left flex items-center p-1 text-[0.35rem]`}
    >
      {label}
    </div>
  );
}
