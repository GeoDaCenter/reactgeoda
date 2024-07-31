import React, {Key, useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Card, CardBody, Chip, Spacer, Tab, Tabs} from '@nextui-org/react';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {VariableSelector} from '../common/variable-selector';
import {GeoDaState} from '@/store';
import {PlotActionProps, addPlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {CreateButton} from '../common/create-button';
import {defaultDatasetIdSelector, selectKeplerDataset} from '@/store/selectors';
import {DatasetSelector} from '../common/dataset-selector';

export function BubbleChartPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [variableX, setVariableX] = useState<string>('');
  const [variableY, setVariableY] = useState<string>('');
  const [variableSize, setVariableSize] = useState<string>('');
  const [variableColor, setVariableColor] = useState<string>('');

  // boolean variable to check if variables are selected for bubble chart
  const isVariablesSelected =
    variableX.length > 0 && variableY.length > 0 && variableSize.length > 0;

  const defaultDatasetId = useSelector(defaultDatasetIdSelector);
  const keplerDataset = useSelector(selectKeplerDataset(defaultDatasetId));
  const [datasetId, setDatasetId] = useState(keplerDataset?.id || '');

  const plots = useSelector((state: GeoDaState) => state.root.plots);

  const onCreateBubbleChart = () => {
    if (isVariablesSelected) {
      dispatch(
        addPlot({
          datasetId,
          type: 'bubble',
          variableX,
          variableY,
          variableSize,
          variableColor
        })
      );
    }
  };

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
      {!keplerDataset ? (
        <WarningBox
          message="Please load a map first before creating and managing your plots."
          type={WarningType.WARNING}
        />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="danger"
            selectedKey={showPlotsManagement ? 'plot-management' : 'bubblechart-creation'}
            onSelectionChange={onTabChange}
          >
            <Tab key="bubblechart-creation" title="Create Bubble Chart">
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4">
                    <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
                    <VariableSelector
                      dataId={datasetId}
                      setVariable={setVariableX}
                      label="Select variable for X-axis"
                    />
                    <VariableSelector
                      dataId={datasetId}
                      setVariable={setVariableY}
                      label="Select variable for Y-axis"
                    />
                    <VariableSelector
                      dataId={datasetId}
                      setVariable={setVariableSize}
                      label="Select variable for bubble size"
                    />
                    <VariableSelector
                      dataId={datasetId}
                      setVariable={setVariableColor}
                      label="Select variable for bubble color (optional)"
                      optional
                    />
                    <Spacer y={1} />
                    <CreateButton
                      onClick={onCreateBubbleChart}
                      isDisabled={isVariablesSelected ? false : true}
                    >
                      Create Bubble Chart
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
