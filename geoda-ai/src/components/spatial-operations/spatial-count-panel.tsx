import {Input, Spacer} from '@nextui-org/react';
import {DatasetSelector} from '../common/dataset-selector';
import VerticalSteps from '../common/vertical-steps';
import {CreateButton} from '../common/create-button';
import {useDispatch, useSelector} from 'react-redux';
import {
  datasetsSelector,
  selectKeplerDataset,
  selectKeplerLayer,
  selectSpatialCountConfig
} from '@/store/selectors';
import React, {useState} from 'react';
import {getDatasetName} from '@/utils/data-utils';
import {WarningBox, WarningType} from '../common/warning-box';
import {runSpatialCountAsync} from '@/actions/spatial-join-actions';

export function SpatialCountPanel() {
  const dispatch = useDispatch<any>();

  const datasets = useSelector(datasetsSelector);

  const spatialCountConfig = useSelector(selectSpatialCountConfig);

  const [firstDatasetId, setFirstDatasetId] = useState(
    spatialCountConfig?.leftDatasetId || datasets?.[0]?.dataId || ''
  );

  const [secondDatasetId, setSecondDatasetId] = useState(spatialCountConfig?.rightDatasetId || '');

  const [newColumnName, setNewColumnName] = useState(spatialCountConfig?.newColumnName || '');

  const [errorMessage, setErrorMessage] = useState(spatialCountConfig?.errorMessage || '');

  const [status, setStatus] = useState(spatialCountConfig?.status || '');

  const [currentStep, setCurrentStep] = useState(1);

  const [isRunning, setIsRunning] = useState(false);

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
    // wait 100 ms to show loading spinner
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch(
      runSpatialCountAsync({
        leftDatasetId: firstDatasetId,
        leftTableName: getDatasetName(datasets, firstDatasetId),
        newColumnName,
        leftLayer,
        rightLayer,
        leftDataset,
        rightDataset
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
          newColumnName?.length === 0 ||
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
