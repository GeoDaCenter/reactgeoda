import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {useEffect, useState} from 'react';
import {Card, CardBody, Chip, Spacer, Tab, Tabs} from '@nextui-org/react';
import {VariableSelector} from '../common/variable-selector';
import {PlotActionProps, addPlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {CreateButton} from '../common/create-button';
import {defaultDatasetIdSelector, selectKeplerDataset} from '@/store/selectors';
import {DatasetSelector} from '../common/dataset-selector';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function ScatterplotPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // State for x and y variables
  const [variableX, setVariableX] = useState<string | undefined>(undefined);
  const [variableY, setVariableY] = useState<string | undefined>(undefined);

  const defaultDatasetId = useSelector(defaultDatasetIdSelector);
  const keplerDataset = useSelector(selectKeplerDataset(defaultDatasetId));
  const [datasetId, setDatasetId] = useState(keplerDataset?.id || '');

  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // Function to handle creation of scatterplot
  const onCreateScatterplot = () => {
    if (keplerDataset && variableX && variableY) {
      dispatch(
        addPlot({
          type: 'scatter',
          variableX,
          variableY,
          datasetId
        })
      );
      // Show the plots management panel
      setShowPlotsManagement(true);
    }
  };

  // Logic for managing new plots
  const newPlotsCount = plots.filter((plot: PlotActionProps) => plot.isNew).length;
  const [showPlotsManagement, setShowPlotsManagement] = useState(newPlotsCount > 0);

  useEffect(() => {
    if (newPlotsCount > 0) {
      plots.forEach((plot: PlotActionProps) => {
        if (plot.isNew) {
          plot.isNew = false;
        }
      });
    }
  }, [newPlotsCount, plots]);

  return (
    <RightPanelContainer
      title={intl.formatMessage({id: 'plot.scatterplot.title', defaultMessage: 'Scatterplot'})}
      description={intl.formatMessage({
        id: 'plot.scatterplot.description',
        defaultMessage: 'Create and manage your scatterplots'
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
            selectedKey={showPlotsManagement ? 'plot-management' : 'scatterplot-creation'}
            onSelectionChange={key => setShowPlotsManagement(key === 'plot-management')}
          >
            <Tab key="scatterplot-creation" title="Create Scatterplot">
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
                    <VariableSelector
                      dataId={datasetId}
                      setVariable={setVariableX}
                      label="Select Independent Variable X"
                    />
                    <VariableSelector
                      dataId={datasetId}
                      setVariable={setVariableY}
                      label="Select Dependent Variable Y"
                    />
                    <Spacer y={1} />
                    <CreateButton
                      onClick={onCreateScatterplot}
                      isDisabled={!variableX || !variableY || !keplerDataset}
                    >
                      Create Scatterplot
                    </CreateButton>
                  </div>
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
