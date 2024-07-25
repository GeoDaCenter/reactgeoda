import {Input, Spacer} from '@nextui-org/react';
import {DatasetSelector} from '../common/dataset-selector';
import VerticalSteps from '../common/vertical-steps';
import {CreateButton} from '../common/create-button';
import {useDispatch, useSelector} from 'react-redux';
import {datasetsSelector, selectKeplerDataset, selectKeplerLayer} from '@/store/selectors';
import React from 'react';
import {spatialJoin} from 'geoda-wasm';
import {useDuckDB} from '@/hooks/use-duckdb';
import {getColumnData, getDatasetName} from '@/utils/data-utils';
import {PreviewDataTable} from '../table/preview-data-table';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {WarningBox, WarningType} from '../common/warning-box';
import {addTableColumn} from '@kepler.gl/actions';
import {Field} from '@kepler.gl/types';
import {VariableSelector} from '../common/variable-selector';
import {getBinaryGeometriesFromLayer, getBinaryGeometryTypeFromLayer} from './spatial-join-utils';
import {isNumber} from '@kepler.gl/utils';

export function SpatialAssignPanel() {
  const {addColumnWithValues} = useDuckDB();
  const dispatch = useDispatch();
  const datasets = useSelector(datasetsSelector);
  const [currentStep, setCurrentStep] = React.useState(1);
  const [firstDatasetId, setFirstDatasetId] = React.useState(datasets?.[0]?.dataId || '');
  const [secondDatasetId, setSecondDatasetId] = React.useState('');
  const [secondVariable, setSecondVariable] = React.useState('');
  const [newColumnName, setNewColumnName] = React.useState('');
  const [assignedValues, setAssignedValues] = React.useState<unknown[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const resetRunningState = () => {
    setIsRunning(false);
    setErrorMessage('');
    setAssignedValues([]);
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

  const onSelectSecondVariable = (variable: string) => {
    setSecondVariable(variable);
    setCurrentStep(3);
    resetRunningState();
  };

  const onNewColumnNameChange = (value: string) => {
    setNewColumnName(value);
    // check if column name not existed in first dataset
    setCurrentStep(4);
    resetRunningState();
  };

  const leftLayer = useSelector(selectKeplerLayer(firstDatasetId));
  const rightLayer = useSelector(selectKeplerLayer(secondDatasetId));
  const leftDataset = useSelector(selectKeplerDataset(firstDatasetId));
  const rightDataset = useSelector(selectKeplerDataset(secondDatasetId));

  const onSpatialAssign = async () => {
    setIsRunning(true);
    if (leftLayer && rightLayer && leftDataset && rightDataset) {
      try {
        // layer could be GeojsonLayer or PointLayer
        const left = getBinaryGeometriesFromLayer(leftLayer, leftDataset);
        const leftGeometryType = getBinaryGeometryTypeFromLayer(leftLayer);
        const right = getBinaryGeometriesFromLayer(rightLayer, rightDataset);
        const rightGeometryType = getBinaryGeometryTypeFromLayer(rightLayer);

        if (!right || !left) {
          throw new Error('Invalid dataset for spatial assign.');
        }

        // @ts-ignore fix types
        const joinResult = await spatialJoin({left, leftGeometryType, right, rightGeometryType});
        // get the column values from the second dataset
        const assignedValues = getColumnData(secondVariable, rightDataset.dataContainer);
        const values = joinResult.map(row => assignedValues[row[0]]);
        // get the original field
        const originalField = rightDataset.fields.find(field => field.name === secondVariable);
        if (!originalField) {
          throw new Error('Invalid field name from the second dataset.');
        }
        // get the table name from first dataset
        const tableName = getDatasetName(datasets, firstDatasetId);
        // add new column to duckdb
        // check if values are array of string
        const isStringArray = values.some(v => typeof v === 'string');
        addColumnWithValues({
          tableName,
          columnName: newColumnName,
          columnValues: values,
          columnType: isStringArray ? 'VARCHAR' : 'NUMERIC'
        });
        // add new column to keplergl
        const newField: Field = {
          ...originalField,
          id: newColumnName,
          name: newColumnName,
          displayName: newColumnName,
          fieldIdx: leftDataset.fields.length,
          valueAccessor: (d: any) => {
            return leftDataset.dataContainer.valueAt(d.index, leftDataset.fields.length);
          }
        };
        dispatch(addTableColumn(firstDatasetId, newField, values));
        setErrorMessage('');
        setIsRunning(false);
        setAssignedValues(values);
      } catch (error: any) {
        setErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto">
      <section className="max-w-sm">
        <p className="mb-5 text-small text-default-500">
          Spatial assign operation assigns the value (e.g. the zipcode) from one dataset (e.g.
          zipcode areas) to another dataset (e.g. crime event) based on the spatial relationship
          between the two datasets.
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
                'The first dataset contains geometries (e.g. points) to which the values (e.g. zipcode or city name) from the second dataset will be assigned.',
              element: (
                <DatasetSelector
                  setDatasetId={onSetFirstDatasetId}
                  datasetId={firstDatasetId}
                  isInvalid={firstDatasetId === null || firstDatasetId.length === 0}
                />
              )
            },
            {
              title: 'Select the second dataset',
              description:
                'The second dataset contains geometries (e.g. polygons) and values (e.g. zip codes or city names) that will be assigned to the geometries in the first dataset.',
              element: (
                <DatasetSelector
                  setDatasetId={onSetSecondDatasetId}
                  datasetId={secondDatasetId}
                  isInvalid={secondDatasetId === null || secondDatasetId.length === 0}
                />
              )
            },
            {
              title: 'Select the column in the second dataset',
              description:
                'The column in the second dataset that contains the values (e.g. zip codes or city names) to be assigned to the geometries in the first dataset.',
              element: (
                <VariableSelector
                  dataId={secondDatasetId}
                  setVariable={onSelectSecondVariable}
                  variableType="integer_or_string"
                  isInvalid={secondVariable === null || secondVariable.length === 0}
                />
              )
            },
            {
              title: 'Input the new column name',
              description:
                'The new column name that will be created in the first dataset with the assigned value.',
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
      {assignedValues.length > 0 ? (
        <WarningBox message="Spatial assign applied successfully" type={WarningType.SUCCESS} />
      ) : (
        isRunning &&
        errorMessage.length > 0 && <WarningBox message={errorMessage} type={WarningType.ERROR} />
      )}
      <Spacer y={2} />
      <CreateButton
        onClick={onSpatialAssign}
        isDisabled={
          newColumnName?.length === 0 ||
          secondDatasetId?.length === 0 ||
          firstDatasetId?.length === 0
        }
      >
        Apply Spatial Assign
      </CreateButton>
      {assignedValues.length > 0 && (
        <PreviewDataTable
          fieldName={newColumnName}
          fieldType={
            assignedValues.some(v => isNumber(v)) ? ALL_FIELD_TYPES.real : ALL_FIELD_TYPES.string
          }
          columnData={assignedValues}
          numberOfRows={assignedValues.length}
        />
      )}
    </div>
  );
}
