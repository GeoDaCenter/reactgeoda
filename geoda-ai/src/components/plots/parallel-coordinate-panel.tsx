import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {MultiVariableSelector} from '../common/multivariable-selector';
import {useEffect, useState} from 'react';
import {Card, CardBody, Chip, Spacer, Tab, Tabs} from '@nextui-org/react';
import {PlotActionProps, addPlot, updatePlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {CreateButton} from '../common/create-button';
import {DatasetSelector} from '../common/dataset-selector';
import {useDatasetFields} from '@/hooks/use-dataset-fields';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function ParallelCoordinatePanel() {
  // use intl
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch();

  // use custom hook
  const {datasetId, keplerDataset, numericFieldNames} = useDatasetFields();

  // use state 
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId);

  // use selector
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // on create pcp
  const onCreateParallelCoordinate = () => {
    // Must have at least 2 variables in order to create a pcp
    if (variables.length >= 2) {
      // dispatch action to create pcp and add to store
      dispatch(addPlot({type: 'parallel-coordinate', variables, datasetId}));
      // Show the plots management panel
      setShowPlotsManagement(true);
    }
  };

  // check if there is any newly added plots, if there is, show plots management tab
  const newPlotsCount = plots.filter((plot: PlotActionProps) => plot.isNew).length;
  const [showPlotsManagement, setShowPlotsManagement] = useState(newPlotsCount > 0);

  // reset isNew flag of plots
  useEffect(() => {
    if (newPlotsCount > 0) {
      plots.forEach((plot: PlotActionProps) => {
        if (plot.isNew) {
          dispatch(updatePlot({...plot, isNew: false}));
        }
      });
    }
  }, [dispatch, newPlotsCount, plots]);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'plot.parallel-coordinate.title',
        defaultMessage: 'Parallel Coordinate Plot'
      })}
      description={intl.formatMessage({
        id: 'plot.parallel-coordinate.description',
        defaultMessage: 'Create and manage your parallel coordinate plots'
      })}
      icon={null}
    >
      {!keplerDataset ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="danger"
            size="md"
            selectedKey={showPlotsManagement ? 'plot-management' : 'parallel-coordinate-creation'}
            onSelectionChange={key => setShowPlotsManagement(key === 'plot-management')}
          >
            <Tab
              key="parallel-coordinate-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Create PCP</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4 text-sm">
                    <DatasetSelector
                      datasetId={selectedDatasetId}
                      setDatasetId={setSelectedDatasetId}
                    />
                    <MultiVariableSelector
                      variables={numericFieldNames}
                      setVariables={setVariables}
                      label="Select at least 2 variables"
                      isInvalid={variables.length < 2}
                    />
                  </div>
                  <Spacer y={8} />
                  <CreateButton
                    onClick={onCreateParallelCoordinate}
                    isDisabled={variables.length === 0}
                  >
                    Create Parallel Coordinate Plot
                  </CreateButton>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="plot-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>Plots Management</span>
                  {plots?.length > 0 && (
                    <Chip size="sm" variant="faded">
                      {plots.length}
                    </Chip>
                  )}
                </div>
              }
            >
              <PlotManagementPanel />
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
