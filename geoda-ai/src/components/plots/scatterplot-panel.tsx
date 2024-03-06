import { useIntl } from 'react-intl';
import { RightPanelContainer } from '../common/right-panel-template';
import { WarningBox } from '../common/warning-box';
import { useDispatch, useSelector } from 'react-redux';
import { GeoDaState } from '@/store';
import { VariableSelector } from '../common/variable-selector';
import { ChangeEvent, Key, useEffect, useState } from 'react';
import { Button, Card, CardBody, Chip, Spacer, Tab, Tabs } from '@nextui-org/react';
import { MultiVariableSelector } from '../common/multivariable-selector';
import { MAP_ID } from '@/constants';
import { getColumnData, getDataContainer } from '@/utils/data-utils';
import { createScatterplotData } from '@/utils/scatterplot-utils';
import { PlotProps, addPlot } from '@/actions/plot-actions';
import { PlotManagementPanel } from './plot-management';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function ScatterplotPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // State for x and y variables
  const [variables, setVariables] = useState<string[]>([]);

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // Function to handle creation of scatterplot
  const onCreateScatterplot = () => {
    console.log('Create scatterplot');
    const xData = getColumnData(variables[0], dataContainer);
    const yData = getColumnData(variables[1], dataContainer);
    const scatterplotData = createScatterplotData(variables[0], variables[1], xData, yData);
    const id = Math.random().toString(36).substring(7);
    dispatch(addPlot({ id, type: 'scatter', variableX: variables[0], variableY: variables[1], data: [scatterplotData] }));
  };

  // Logic for managing new plots and updating UI similar to HistogramPanel
  const newPlotsCount = plots.filter((plot: PlotProps) => plot.isNew).length;
  const [showPlotsManagement, setShowPlotsManagement] = useState(newPlotsCount > 0);

  useEffect(() => {
    if (newPlotsCount > 0) {
      plots.forEach((plot: PlotProps) => {
        if (plot.isNew) {
          plot.isNew = false;
        }
      });
    }
  }, [newPlotsCount, plots]);

  const plotsLength = plots?.length;
  useEffect(() => {
    if (plotsLength) {
      setShowPlotsManagement(true);
    }
  }, [plotsLength]);

  const onTabChange = (key: Key) => {
    setShowPlotsManagement(key === 'plot-management');
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({ id: 'plot.scatterplot.title', defaultMessage: 'Scatterplot' })}
      description={intl.formatMessage({ id: 'plot.scatterplot.description', defaultMessage: 'Create and manage your scatterplots' })}
      icon={null}
    >
      {!tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            selectedKey={showPlotsManagement ? 'plot-management' : 'scatterplot-creation'}
            onSelectionChange={onTabChange}
          >
            <Tab
              key="scatterplot-creation"
              title="Create Scatterplot"
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <MultiVariableSelector setVariables={setVariables} />
                    <Spacer y={1} />
                    <Button
                      onClick={onCreateScatterplot}
                      disabled={variables.some(variable => variable === '')}
                    >
                      Create Scatterplot
                    </Button>
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
