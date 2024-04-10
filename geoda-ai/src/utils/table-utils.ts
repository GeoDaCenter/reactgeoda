import KeplerTable from '@kepler.gl/table';
import {defaultOperators} from 'react-querybuilder';

export function getQueryBuilderFields(dataset: KeplerTable | undefined) {
  const fields: any = [];

  dataset?.fields.forEach(field => {
    if (field.type === 'string') {
      const uniqueValues = new Set<string>();
      for (let i = 0; i < dataset.length; i++) {
        uniqueValues.add(dataset.getValue(field.name, i));
      }
      // convert unique values to array
      const uniqueValuesArray = Array.from(uniqueValues);
      const values = uniqueValuesArray.map(value => ({label: value, name: value}));
      fields.push({
        name: field.name,
        label: field.name,
        valueEditorType: 'select',
        operators: defaultOperators.filter(op => op.name === '='),
        values
      });
    }
    fields.push({name: field.name, label: field.name});
  });
  return fields;
}
