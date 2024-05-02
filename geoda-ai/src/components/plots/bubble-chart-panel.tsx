import React, { Key, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Button, Card, CardBody, Chip, Spacer, Tab, Tabs } from '@nextui-org/react';
import { RightPanelContainer } from '../common/right-panel-template';
import { WarningBox } from '../common/warning-box';
import { VariableSelector } from '../common/variable-selector';
import { GeoDaState } from '@/store';
import { getColumnData, getDataContainer } from '@/utils/data-utils';
import { createBubbleChartData } from '@/utils/bubblechart-utils';
import { PlotProps, addPlot } from '@/actions/plot-actions';
import { PlotManagementPanel } from './plot-management';
import {MAP_ID} from '@/constants';

export function BubbleChartPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [variableX, setVariableX] = useState<string | undefined>(undefined);
  const [variableY, setVariableY] = useState<string | undefined>(undefined);
  const [variableSize, setVariableSize] = useState<string | undefined>(undefined);
  const [variableColor, setVariableColor] = useState<string | undefined>(undefined);

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  const onCreateBubbleChart = () => {
    if (variableX && variableY && variableSize) {
      const xData = getColumnData(variableX, dataContainer);
      const yData = getColumnData(variableY, dataContainer);
      const sizeData = getColumnData(variableSize, dataContainer);
      const colorData = variableColor ? getColumnData(variableColor, dataContainer) : undefined;

      const bubbleChartData = createBubbleChartData(
        variableX, variableY, variableSize, variableColor, xData, yData, sizeData, colorData
      );

      const id = Math.random().toString(36).substring(7);
      dispatch(addPlot({ id, type: 'bubble', variableX, variableY, variableSize, variableColor, data: bubbleChartData }));
    } else {
      console.error('Required variables must be selected for a bubble chart');
    }
  };

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
      title={intl.formatMessage({id: 'plot.bubblechart.title', defaultMessage: 'Bubble Chart'})}
      description={intl.formatMessage({
        id: 'plot.bubblechart.description',
        defaultMessage: 'Create and manage your bubble charts'
      })}
      icon={null}
    >
      {!tableName ? (
        <WarningBox message="Please load a map first before creating and managing your plots." type="warning" /> // type warning? same in scatter
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
            selectedKey={showPlotsManagement ? 'plot-management' : 'bubblechart-creation'}
            onSelectionChange={onTabChange}
          >
            <Tab key="bubblechart-creation" title="Create Bubble Chart">
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <VariableSelector variable={variableX} setVariable={setVariableX} />
                    <VariableSelector variable={variableY} setVariable={setVariableY} />
                    <VariableSelector variable={variableSize} setVariable={setVariableSize} />
                    <VariableSelector variable={variableColor} setVariable={setVariableColor} optional />
                    <Spacer y={1} />
                    <Button onClick={onCreateBubbleChart} disabled={!variableX || !variableY || !variableSize}>
                      Create Bubble Chart
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
};
