import {Card, CardBody, CardHeader, Input, Spacer} from '@nextui-org/react';
import {DatasetSelector} from '../common/dataset-selector';
import VerticalSteps from '../common/vertical-steps';
import {CreateButton} from '../common/create-button';
import {useDispatch, useSelector} from 'react-redux';
import {datasetsSelector, selectKeplerDataset, selectKeplerLayer} from '@/store/selectors';
import React from 'react';
import {spatialJoin} from 'geoda-wasm';
import {useDuckDB} from '@/hooks/use-duckdb';
import {
  getBinaryGeometriesFromPointLayer,
  getBinaryGeometryTypeFromPointLayer,
  getDatasetName,
  isPointLayer
} from '@/utils/data-utils';
import {PreviewDataTable} from '../table/preview-data-table';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {WarningBox, WarningType} from '../common/warning-box';
import {addTableColumn} from '@kepler.gl/actions';
import {Field} from '@kepler.gl/types';
import {getBinaryGeometriesFromLayer, getBinaryGeometryTypeFromLayer} from './spatial-join-utils';

export function SpatialCountPanel() {
  const {addColumnWithValues} = useDuckDB();
  const dispatch = useDispatch();
  const datasets = useSelector(datasetsSelector);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [firstDatasetId, setFirstDatasetId] = React.useState(datasets?.[0]?.dataId || '');
  const [secondDatasetId, setSecondDatasetId] = React.useState('');
  const [newColumnName, setNewColumnName] = React.useState('');
  const [counts, setCounts] = React.useState<number[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const resetRunningState = () => {
    setIsRunning(false);
    setErrorMessage('');
    setCounts([]);
  };

  const onSetFirstDatasetId = (datasetId: string) => {
    setFirstDatasetId(datasetId);
    setCurrentStep(1);
    // reset
    resetRunningState();
  };

  const onSetSecondDatasetId = (datasetId: string) => {
    setSecondDatasetId(datasetId);
    setCurrentStep(2);
    resetRunningState();
  };

  const onNewColumnNameChange = (value: string) => {
    setNewColumnName(value);
    setCurrentStep(3);
    resetRunningState();
  };

  const leftLayer = useSelector(selectKeplerLayer(firstDatasetId));
  const rightLayer = useSelector(selectKeplerLayer(secondDatasetId));
  const leftDataset = useSelector(selectKeplerDataset(firstDatasetId));
  const rightDataset = useSelector(selectKeplerDataset(secondDatasetId));

  const onSpatialCount = async () => {
    setIsRunning(true);
    if (leftLayer && rightLayer && leftDataset) {
      try {
        // layer could be GeojsonLayer or PointLayer
        const left = getBinaryGeometriesFromLayer(leftLayer, leftDataset);
        const leftGeometryType = getBinaryGeometryTypeFromLayer(leftLayer);
        const right = getBinaryGeometriesFromLayer(rightLayer, rightDataset);
        const rightGeometryType = getBinaryGeometryTypeFromLayer(rightLayer);

        if (!right || !left) {
          throw new Error('Invalid dataset for spatial count.');
        }

        // @ts-ignore fix types
        const joinResult = await spatialJoin({left, leftGeometryType, right, rightGeometryType});
        // convert joinResult to counts
        const values = joinResult.map(row => row.length);
        setCounts(values);
        // save counts to the new column
        // get the table name from first dataset
        const tableName = getDatasetName(datasets, firstDatasetId);
        // add new column to duckdb
        addColumnWithValues({
          tableName,
          columnName: newColumnName,
          columnValues: values,
          columnType: 'NUMERIC'
        });
        // add new column to keplergl
        const newField: Field = {
          id: newColumnName,
          name: newColumnName,
          displayName: newColumnName,
          format: '',
          type: ALL_FIELD_TYPES.integer,
          analyzerType: 'INTEGER',
          fieldIdx: leftDataset.fields.length,
          valueAccessor: (d: any) => {
            return leftDataset.dataContainer.valueAt(d.index, leftDataset.fields.length);
          }
        };
        dispatch(addTableColumn(firstDatasetId, newField, values));
        setErrorMessage('');
        setIsRunning(false);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto">
      <section className="max-w-sm">
        <p className="mb-5 text-small text-default-500">
          Spatial count is a spatial operation that counts the number of geometries (e.g. points) in
          one dataset that intersect with geometries (e.g. polygons) in another dataset. For
          example, count how many events occurred in each zipcode area and save the counts in a new
          column.
        </p>
        <VerticalSteps
          hideProgressBars
          className="max-w-sm"
          defaultStep={-1}
          currentStep={currentStep}
          stepClassName="border border-default-200 dark:border-default-50 aria-[current]:bg-default-100 dark:aria-[current]:bg-default-50"
          steps={[
            {
              title: 'Select the first dataset',
              description:
                'The first dataset with geometries (e.g. polygons) that contain/intersect geometries from the second dataset.',
              element: (
                <DatasetSelector
                  setDatasetId={onSetFirstDatasetId}
                  datasetId={firstDatasetId}
                  isInvalid={firstDatasetId?.length === 0}
                />
              )
            },
            {
              title: 'Select the second dataset',
              description:
                'The second dataset with geometries (e.g. points) that will be counted by the geometries in the first dataset.',
              element: (
                <DatasetSelector
                  setDatasetId={onSetSecondDatasetId}
                  datasetId={secondDatasetId}
                  isInvalid={secondDatasetId?.length === 0}
                />
              )
            },
            {
              title: 'Input the new column name',
              description:
                'The new column name that will be created in the first dataset with the count values.',
              element: (
                <Input
                  type="text"
                  label="New column"
                  placeholder="Enter the new column name"
                  onValueChange={onNewColumnNameChange}
                  value={newColumnName}
                  isInvalid={newColumnName?.length === 0}
                />
              )
            }
          ]}
        />
      </section>
      {counts.length > 0 ? (
        <WarningBox message="Spatial count applied successfully" type={WarningType.SUCCESS} />
      ) : (
        isRunning &&
        errorMessage.length > 0 && <WarningBox message={errorMessage} type={WarningType.ERROR} />
      )}
      <Spacer y={2} />
      <CreateButton
        onClick={onSpatialCount}
        isDisabled={
          newColumnName?.length === 0 ||
          secondDatasetId?.length === 0 ||
          firstDatasetId?.length === 0
        }
      >
        Apply Spatial Count
      </CreateButton>
      {counts.length > 0 && (
        <Card className="m-1">
          <CardHeader>
            <p className="text-tiny">Column Preview</p>
          </CardHeader>
          <CardBody>
            <PreviewDataTable
              fieldName={newColumnName}
              fieldType={ALL_FIELD_TYPES.integer}
              columnData={counts}
              numberOfRows={counts.length}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
