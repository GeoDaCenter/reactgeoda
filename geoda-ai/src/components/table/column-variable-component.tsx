import {
  Card,
  CardBody,
  Input,
  ScrollShadow,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from '@nextui-org/react';
import fuzzy from 'fuzzy';

import {SQLEditor, SQLEditorRefProps} from './sql-editor';
import {useSelector} from 'react-redux';
import {Key, useEffect, useMemo, useRef, useState} from 'react';
import {GeoDaState} from '@/store';
import {getDataset} from '@/utils/data-utils';
import {
  DUCKDB_AGGREGATE_FUNCTIONS,
  DUCKDB_DATE_FUNCTIONS,
  DUCKDB_DATE_PART_FUNCTIONS,
  DUCKDB_NUMERIC_FUNCTIONS,
  DUCKDB_STATS_FUNCTIONS,
  DuckDBFunctionProps
} from './sql-constant';
import {SearchIcon} from '../icons/search';
import {useDuckDB} from '@/hooks/use-duckdb';
import {mainTableNameSelector} from '@/store/selectors';

const AVAILABLE_FUNCTIONS = [
  ...DUCKDB_NUMERIC_FUNCTIONS,
  ...DUCKDB_AGGREGATE_FUNCTIONS,
  ...DUCKDB_DATE_FUNCTIONS,
  ...DUCKDB_DATE_PART_FUNCTIONS,
  ...DUCKDB_STATS_FUNCTIONS
];

export type TableVariableValueProps = {
  setValues: (values: unknown | unknown[]) => void;
};

export function TableVariableValueComponent({setValues}: TableVariableValueProps) {
  const [code, setCode] = useState('');
  const [filteredFunctions, setFilteredFunctions] =
    useState<DuckDBFunctionProps[]>(AVAILABLE_FUNCTIONS);
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataset = useSelector((state: GeoDaState) => getDataset(state));
  const tableName = useSelector(mainTableNameSelector);

  const {queryValues} = useDuckDB();

  const editorRef = useRef<SQLEditorRefProps>(null);

  const aggregateFuncNamesRegex = useMemo(() => {
    const replace = [...DUCKDB_AGGREGATE_FUNCTIONS, ...DUCKDB_STATS_FUNCTIONS]
      .map(func => func.name.replace(/\(.*\)/g, ''))
      .join('|');
    return new RegExp(`(${replace})\\(([^)]+)\\)`, 'g');
  }, []);

  // insert function name at the cursor in the code editor when user clicks on the function table
  const onRowClick = (key: Key) => {
    const filteredIndex = key as number;
    const func = filteredFunctions[filteredIndex];
    // insert func.name at the cursor in the code editor
    if (editorRef && editorRef.current) {
      editorRef.current.insertText(func.name);
    }
  };

  useEffect(() => {
    (async () => {
      // when code changes, update the values
      // replace any aggregate function with select_agg function using regex
      const updatedCode = code.replace(
        aggregateFuncNamesRegex,
        `(select $1($2) from "${tableName}")`
      );
      const sql = `SELECT ${updatedCode} FROM "${tableName}";`;
      const result = await queryValues(sql);
      setValues(Array.from(result));
    })();
  }, [aggregateFuncNamesRegex, code, queryValues, setValues, tableName]);

  // get suggest keys from dataset fields
  const suggestKeys = [
    ...(dataset?.fields.map(field => field.name) || []),
    ...AVAILABLE_FUNCTIONS.map(func => func.name.replace(/\(.*\)/g, ''))
  ];

  const onSQLEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
    }
  };

  const onSearchFunction = (value: string) => {
    // filter available functions by doing fuzzy search on function name
    const result = fuzzy
      .filter(value, AVAILABLE_FUNCTIONS, {
        extract: el => el.name
      })
      .map(res => res.original);
    setFilteredFunctions(result);
  };

  return (
    <div className="flex flex-col gap-2 text-tiny">
      <p>
        Use SQL operations and functions to create new variable, e.g. (HR60 + HR70) / (PO60 + PO70)
      </p>
      <Card>
        <CardBody>
          <div className="relative h-20 w-full">
            <SQLEditor
              initContent={code}
              onChange={onSQLEditorChange}
              theme={theme}
              suggestKeys={suggestKeys}
              language="geoda"
              height={100}
              ref={editorRef}
            />
          </div>
        </CardBody>
      </Card>
      <div className="flex w-full flex-col gap-1 p-1">
        {/* <div className="flex w-full flex-row gap-1">
          {DUCKDB_OPERATORS.slice(0, 9).map((op, index) => (
            <Tooltip content={op.description} key={index}>
              <Button size="sm" className="h-6 w-4 min-w-1">
                {op.name}
              </Button>
            </Tooltip>
          ))}
        </div> */}
        <Input
          label=""
          placeholder="Type to search avaiable duckdb SQL function..."
          startContent={
            <SearchIcon className="pointer-events-none mb-0.5 flex-shrink-0 text-black/50 text-slate-400 dark:text-white/90" />
          }
          size="sm"
          onValueChange={onSearchFunction}
        />
        <div className="w-full">
          <ScrollShadow className="h-[100px] w-full p-1" size={10}>
            <Table
              hideHeader
              aria-label="Duckdb function"
              removeWrapper
              isStriped
              isCompact
              radius="none"
              selectionMode="single"
              onRowAction={onRowClick}
            >
              <TableHeader>
                <TableColumn width={20} maxWidth={20}>
                  NAME
                </TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
              </TableHeader>
              <TableBody>
                {filteredFunctions.map((func, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-tiny text-default-500">{func.name}</TableCell>
                    <TableCell className="text-tiny text-default-500">{func.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollShadow>
        </div>
      </div>
    </div>
  );
}
