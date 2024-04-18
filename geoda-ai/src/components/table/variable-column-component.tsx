import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip
} from '@nextui-org/react';
import MonacoEditor from '@monaco-editor/react';

const DUCKDB_FUNCTIONS = [
  {name: 'abs', description: 'Absolute value'},
  {name: 'acos', description: 'Arc cosine'},
  {name: 'acosh', description: 'Inverse hyperbolic cosine'},
  {name: 'asin', description: 'Arc sine'},
  {name: 'asinh', description: 'Inverse hyperbolic sine'},
  {name: 'atan', description: 'Arc tangent'},
  {name: 'atanh', description: 'Inverse hyperbolic tangent'},
  {name: 'avg', description: 'Average'},
  {name: 'ceil', description: 'Ceiling'},
  {name: 'cos', description: 'Cosine'},
  {name: 'cosh', description: 'Hyperbolic cosine'},
  {name: 'count', description: 'Count'},
  {name: 'degrees', description: 'Degrees'},
  {name: 'exp', description: 'Exponential'},
  {name: 'floor', description: 'Floor'},
  {name: 'ln', description: 'Natural logarithm'},
  {name: 'log', description: 'Logarithm'},
  {name: 'max', description: 'Maximum'},
  {name: 'min', description: 'Minimum'},
  {name: 'pi', description: 'Pi'},
  {name: 'pow', description: 'Power'},
  {name: 'radians', description: 'Radians'},
  {name: 'round', description: 'Round'},
  {name: 'sin', description: 'Sine'},
  {name: 'sinh', description: 'Hyperbolic sine'},
  {name: 'sqrt', description: 'Square root'},
  {name: 'sum', description: 'Sum'},
  {name: 'tan', description: 'Tangent'},
  {name: 'tanh', description: 'Hyperbolic tangent'},
  {name: 'variance', description: 'Variance'},
  {name: 'var_pop', description: 'Population variance'},
  {name: 'var_samp', description: 'Sample variance'},
  {name: 'stddev', description: 'Standard deviation'},
  {name: 'stddev_pop', description: 'Population standard deviation'},
  {name: 'stddev_samp', description: 'Sample standard deviation'},
  {name: 'random', description: 'Random number'}
];

const DUCKDB_OPERATORS = [
  {name: '+', description: 'Addition'},
  {name: '-', description: 'Subtraction'},
  {name: '*', description: 'Multiplication'},
  {name: '/', description: 'Division'},
  {name: '%', description: 'Modulo'},
  {name: '^', description: 'Power'}
];

export const tableVariableAccordionItemClasses = {
  base: 'py-0 w-full m-0',
  title: 'font-normal text-xs',
  indicator: 'text-medium',
  content: 'text-small px-0'
};

export function TableVariableValueComponent() {
  return (
    <div className="flex flex-col gap-2 text-tiny">
      <p>
        Use basic operations and functions available in DuckDB to create new variables in the table
      </p>
      <Card>
        <CardBody>
          <div className="relative h-20 w-full">
            <MonacoEditor
              defaultLanguage="sql"
              options={{
                minimap: {enabled: false},
                fixedOverflowWidgets: true,
                lineNumbers: 'off'
              }}
            />
          </div>
        </CardBody>
      </Card>
      <Accordion
        defaultExpandedKeys={['1']}
        itemClasses={tableVariableAccordionItemClasses}
        selectionMode="multiple"
        variant="light"
        showDivider={false}
      >
        <AccordionItem key="1" aria-label="Basic operations:" subtitle="" title="Basic operations:">
          <div className="flex flex-row gap-1">
            {DUCKDB_OPERATORS.map((op, index) => (
              <Tooltip content={op.description} key={index}>
                <Button size="sm" className="h-6 w-4 min-w-1">
                  {op.name}
                </Button>
              </Tooltip>
            ))}
          </div>
        </AccordionItem>
        <AccordionItem
          key="2"
          aria-label="Available Duckdb functions:"
          subtitle=""
          title="Available Duckdb functions:"
        >
          <ScrollShadow className="h-[100px] w-[400px] p-1">
            <Table
              hideHeader
              aria-label="Duckdb function"
              className="w-full"
              removeWrapper
              isStriped
              selectionMode="single"
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
              </TableHeader>
              <TableBody>
                {DUCKDB_FUNCTIONS.map((func, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-tiny text-default-500">{func.name}</TableCell>
                    <TableCell className="text-tiny text-default-500">{func.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollShadow>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
