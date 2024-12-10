import React, {Dispatch, useState} from 'react';
import {Spacer} from '@nextui-org/react';
import {DatasetSelector} from '../common/dataset-selector';
import VerticalSteps from '../common/vertical-steps';
import {CreateButton} from '../common/create-button';
import {WarningBox, WarningType} from '../common/warning-box';
import {
  AssignVariable,
  runSpatialAssignAsync,
  SpatialAssignActionPayload
} from '@/actions/spatial-join-actions';
import {useSpatialAssignFields} from '@/hooks/use-dataset-fields';
import {DatasetProps} from '@/reducers/file-reducer';
import {AssignTable} from './assign-table';

type SpatialAssignPanelProps = {
  datasets: DatasetProps[];
  spatialAssignConfig?: SpatialAssignActionPayload;
  dispatch: Dispatch<any>;
};

export function SpatialAssignPanel({
  datasets,
  spatialAssignConfig,
  dispatch
}: SpatialAssignPanelProps) {
  // use state
  const [firstDatasetId, setFirstDatasetId] = useState(
    spatialAssignConfig?.leftDatasetId || datasets?.[0]?.dataId || ''
  );
  const [secondDatasetId, setSecondDatasetId] = useState(spatialAssignConfig?.rightDatasetId || '');
  const [status, setStatus] = useState(spatialAssignConfig?.status || '');
  const [errorMessage, setErrorMessage] = useState(spatialAssignConfig?.errorMessage || '');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [assignVariables, setAssignVariables] = useState<AssignVariable[]>([]);

  const {fieldNames: leftFieldNames} = useSpatialAssignFields(firstDatasetId);
  const {fieldNames: rightFieldNames} = useSpatialAssignFields(secondDatasetId);

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

  const onAssignVariablesUpdated = (variables: AssignVariable[]) => {
    setAssignVariables(variables);
    setCurrentStep(3);
    resetRunningState();
  };

  const onSpatialAssign = async () => {
    setIsRunning(true);
    // wait 100 ms to show loading spinner
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch(
      runSpatialAssignAsync({
        leftDatasetId: firstDatasetId,
        rightDatasetId: secondDatasetId,
        assignVariables
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
              title: 'Select the variables in the second dataset',
              description:
                'The column in the second dataset that contains the values (e.g. zip codes or city names) to be assigned to the geometries in the first dataset.',
              element: (
                <AssignTable
                  originalVariables={leftFieldNames}
                  assignVariables={rightFieldNames}
                  onVariablesUpdated={onAssignVariablesUpdated}
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
          assignVariables?.length === 0 ||
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
