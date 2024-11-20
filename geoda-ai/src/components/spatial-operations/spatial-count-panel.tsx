import {Spacer} from '@nextui-org/react';
import {DatasetSelector} from '../common/dataset-selector';
import VerticalSteps from '../common/vertical-steps';
import {CreateButton} from '../common/create-button';
import React, {Dispatch, useState} from 'react';
import {WarningBox, WarningType} from '../common/warning-box';
import {runSpatialCountAsync, SpatialCountActionPayload} from '@/actions/spatial-join-actions';
import {DatasetProps} from '@/reducers/file-reducer';
import {useSpatialJoinFields} from '@/hooks/use-dataset-fields';
import {JoinTable} from './join-table';

type JoinVariable = {
  variableName: string;
  operation: string;
  newVariableName: string;
};
export type SpatialCountPanelProps = {
  datasets: DatasetProps[];
  spatialCountConfig?: SpatialCountActionPayload;
  dispatch: Dispatch<any>;
};

export function SpatialCountPanel({
  datasets,
  spatialCountConfig,
  dispatch
}: SpatialCountPanelProps) {
  const [firstDatasetId, setFirstDatasetId] = useState(
    spatialCountConfig?.leftDatasetId || datasets?.[0]?.dataId || ''
  );
  const [secondDatasetId, setSecondDatasetId] = useState(spatialCountConfig?.rightDatasetId || '');
  const [errorMessage, setErrorMessage] = useState(spatialCountConfig?.errorMessage || '');
  const [status, setStatus] = useState(spatialCountConfig?.status || '');
  const [currentStep, setCurrentStep] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [joinVariables, setJoinVariables] = useState<JoinVariable[]>([]);

  const {joinableFieldNames} = useSpatialJoinFields(secondDatasetId);

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
    // get variables from this dataset
    setCurrentStep(2);
    resetRunningState();
  };

  const onJoinVariablesUpdated = (variables: JoinVariable[]) => {
    setJoinVariables(variables);
    setCurrentStep(3);
    resetRunningState();
  };

  const onSpatialCount = async () => {
    setIsRunning(true);
    // wait 100 ms to show loading spinner
    await new Promise(resolve => setTimeout(resolve, 100));
    dispatch(
      runSpatialCountAsync({
        leftDatasetId: firstDatasetId,
        rightDatasetId: secondDatasetId,
        joinVariables
      })
    );
    resetRunningState();
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
                <DatasetSelector setDatasetId={onSetFirstDatasetId} datasetId={firstDatasetId} />
              )
            },
            {
              title: 'Select the second dataset',
              description:
                'The second dataset with geometries (e.g. points) that will be counted by the geometries in the first dataset.',
              element: (
                <DatasetSelector setDatasetId={onSetSecondDatasetId} datasetId={secondDatasetId} />
              )
            },
            {
              title: 'Select the variables to join',
              description:
                'Select the variables and the operation to join the second dataset to the first dataset.',
              element: (
                <div className="flex w-full flex-col">
                  <JoinTable
                    joinVariables={joinableFieldNames}
                    onVariablesUpdated={onJoinVariablesUpdated}
                  />
                </div>
              )
            }
          ]}
        />
      </section>
      {status === 'success' ? (
        <WarningBox message="Spatial count applied successfully" type={WarningType.SUCCESS} />
      ) : (
        isRunning &&
        errorMessage.length > 0 && <WarningBox message={errorMessage} type={WarningType.ERROR} />
      )}
      <Spacer y={2} />
      <CreateButton
        onClick={onSpatialCount}
        isDisabled={
          joinVariables?.length === 0 ||
          secondDatasetId?.length === 0 ||
          firstDatasetId?.length === 0
        }
        isRunning={isRunning}
      >
        Apply Spatial Count
      </CreateButton>
    </div>
  );
}
