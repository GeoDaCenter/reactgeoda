import React, {useState} from 'react';
import {Input, Spacer} from '@nextui-org/react';
import {DatasetSelector} from '../common/dataset-selector';
import VerticalSteps from '../common/vertical-steps';
import {CreateButton} from '../common/create-button';
import {useDispatch, useSelector} from 'react-redux';
import {
  datasetsSelector,
  selectKeplerDataset,
  selectKeplerLayer,
  selectSpatialAssignConfig
} from '@/store/selectors';
import {getDatasetName} from '@/utils/data-utils';
import {WarningBox, WarningType} from '../common/warning-box';
import {VARIABLE_TYPE, VariableSelector} from '../common/variable-selector';
import {runSpatialAssignAsync} from '@/actions/spatial-join-actions';

export function SpatialAssignPanel() {
  const dispatch = useDispatch<any>();

  const datasets = useSelector(datasetsSelector);

  const spatialAssignConfig = useSelector(selectSpatialAssignConfig);

  const [firstDatasetId, setFirstDatasetId] = useState(
    spatialAssignConfig?.leftDatasetId || datasets?.[0]?.dataId || ''
  );

  const [secondDatasetId, setSecondDatasetId] = useState(spatialAssignConfig?.rightDatasetId || '');

  const [secondVariable, setSecondVariable] = useState(spatialAssignConfig?.rightColumnName || '');

  const [newColumnName, setNewColumnName] = useState(spatialAssignConfig?.newColumnName || '');

  const [status, setStatus] = useState(spatialAssignConfig?.status || '');

  const [errorMessage, setErrorMessage] = useState(spatialAssignConfig?.errorMessage || '');

  const [isRunning, setIsRunning] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  // get layers and datasets
  const leftLayer = useSelector(selectKeplerLayer(firstDatasetId));
  const rightLayer = useSelector(selectKeplerLayer(secondDatasetId));
  const leftDataset = useSelector(selectKeplerDataset(firstDatasetId));
  const rightDataset = useSelector(selectKeplerDataset(secondDatasetId));

  const resetRunningState = () => {
    setIsRunning(false);
    setErrorMessage('');
    setStatus('');
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

  const onSpatialAssign = async () => {
    setIsRunning(true);
    // wait 100 ms to show loading spinner
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch(
      runSpatialAssignAsync({
        leftDatasetId: firstDatasetId,
        leftTableName: getDatasetName(datasets, firstDatasetId),
        newColumnName,
        leftLayer,
        rightLayer,
        leftDataset,
        rightDataset,
        rightColumnName: secondVariable
      })
    );
    resetRunningState();
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
                <DatasetSelector setDatasetId={onSetFirstDatasetId} datasetId={firstDatasetId} />
              )
            },
            {
              title: 'Select the second dataset',
              description:
                'The second dataset contains geometries (e.g. polygons) and values (e.g. zip codes or city names) that will be assigned to the geometries in the first dataset.',
              element: (
                <DatasetSelector setDatasetId={onSetSecondDatasetId} datasetId={secondDatasetId} />
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
                  variableType={VARIABLE_TYPE.IntegerOrString}
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
      {status === 'success' ? (
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
        isRunning={isRunning}
      >
        Apply Spatial Assign
      </CreateButton>
    </div>
  );
}
