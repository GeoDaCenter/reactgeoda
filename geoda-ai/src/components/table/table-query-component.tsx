import {DuckDB} from '@/hooks/use-duckdb';
import {GeoDaState} from '@/store';
import {getQueryBuilderFields} from '@/utils/table-utils';
import {Button, Card, CardBody, CardHeader, Checkbox} from '@nextui-org/react';
import {useMemo, useState} from 'react';
import QueryBuilder, {formatQuery, RuleGroupType} from 'react-querybuilder';
import {parseSQL} from 'react-querybuilder/parseSQL';
import {useDispatch, useSelector} from 'react-redux';
import MonacoEditor from '@monaco-editor/react';

import 'react-querybuilder/dist/query-builder.css';
import {geodaBrushLink, setQueryCode} from '@/actions';
import {DatasetSelector} from '../common/dataset-selector';
import KeplerTable from '@kepler.gl/table';

// const initialQuery: RuleGroupType = {combinator: 'and', rules: []};

function getQueryBuilder(sql: string) {
  try {
    return parseSQL(sql);
  } catch (e) {
    return {combinator: 'and', rules: []};
  }
}

export function TableQueryComponent({
  datasetId,
  setDatasetId,
  keplerDataset,
  tableName
}: {
  datasetId: string;
  setDatasetId: (datasetId: string) => void;
  keplerDataset: KeplerTable;
  tableName: string;
}) {
  const id = 'table-query';

  const dispatch = useDispatch();

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const queryCode = useSelector((state: GeoDaState) => state.root.uiState.table.queryCode);

  // parse the query code, if runtime error occurs, use default initialQuery
  const queryBuilder = getQueryBuilder(queryCode || `select * from ${tableName}`);

  // get fields for query builder
  const fields = useMemo(() => getQueryBuilderFields(keplerDataset), [keplerDataset]);

  const [code, setCode] = useState(queryCode || '');
  const [sqlQuery, setSqlQuery] = useState<RuleGroupType>(queryBuilder);
  const [useQueryBuilder, setUseQueryBuilder] = useState(true);

  const onMonacoEditorChange = (value: string | undefined) => {
    if (value) {
      setCode(value);
      dispatch(setQueryCode(value));
    }
  };

  const onResetClick = async () => {
    setCode('');
    setSqlQuery({combinator: 'and', rules: []});
    dispatch(setQueryCode(''));
    await onQueryClick();
  };

  const onQueryBuilderClick = (value: boolean) => {
    setUseQueryBuilder(value);
  };

  const onQueryChange = (queryString: RuleGroupType) => {
    setSqlQuery(queryString);
    const updatedCode = formatQuery(queryString, {format: 'sql', fallbackExpression: '()'});
    setCode(updatedCode);
  };

  // write callback function onQueryClick
  const onQueryClick = async () => {
    const selectedIndexes = await DuckDB.getInstance().query(tableName, code);

    if (selectedIndexes) {
      dispatch(geodaBrushLink({sourceId: id, dataId: datasetId, filteredIndex: selectedIndexes}));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
      <div className="m-2 flex flex-col gap-4 text-xs">
        <Checkbox
          defaultSelected
          size="sm"
          checked={useQueryBuilder}
          onValueChange={onQueryBuilderClick}
        >
          Use Query Builder
        </Checkbox>
        {useQueryBuilder && (
          <QueryBuilder
            query={sqlQuery}
            onQueryChange={onQueryChange}
            fields={fields}
            controlClassnames={{queryBuilder: 'queryBuilder-branches'}}
          />
        )}
      </div>
      <Card>
        <CardHeader>
          <p className="ml-2 text-xs text-blue-700 drop-shadow-sm">
            SELECT * FROM {tableName} WHERE
          </p>
        </CardHeader>
        <CardBody>
          <div className="h-40 w-full">
            <MonacoEditor
              language="sql"
              value={code}
              onChange={onMonacoEditorChange}
              options={{
                minimap: {enabled: false}
              }}
              theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
            />
          </div>
        </CardBody>
      </Card>
      <div className="m-2 flex w-full flex-row items-start space-x-4">
        <Button onClick={onQueryClick} size="sm" color="danger" className="bg-rose-900">
          Query
        </Button>
        <Button onClick={onResetClick} size="sm" color="default">
          Reset
        </Button>
      </div>
    </div>
  );
}
