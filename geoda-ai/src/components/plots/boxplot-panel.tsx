import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {MultiVariableSelector} from '../common/multivariable-selector';
import {Key, useEffect, useMemo, useState} from 'react';
import {Card, CardBody, Chip, Spacer, Tab, Tabs, RadioGroup, Radio} from '@nextui-org/react';
import {PlotActionProps, addPlot, updatePlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {CreateButton} from '../common/create-button';
import {useDatasetFields} from '@/hooks/use-dataset-fields';
import {DatasetSelector} from '../common/dataset-selector';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function BoxplotPanel() {
  // use intl
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch();

  // use custom hook
  const {datasetId, keplerDataset, numericFieldNames} = useDatasetFields();

  // use state
  const [variables, setVariables] = useState<string[]>([]);
  const [hingeValue, setHingeValue] = useState('1.5');
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId);

  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // on create boxplot // Updated function name
  const onCreateBoxplot = () => {
    if (variables.length > 0) {
      // get hinge value as number
      const boundIQR = parseFloat(hingeValue);
      // dispatch action to create boxplot and add to store
      dispatch(addPlot({type: 'boxplot', variables, datasetId, boundIQR}));
      // show plots management tab
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

  const onTabChange = (key: Key) => {
    setShowPlotsManagement(key === 'plot-management');
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'plot.boxplot.title',
        defaultMessage: 'Boxplot'
      })}
      description={intl.formatMessage({
        id: 'plot.boxplot.description',
        defaultMessage: 'Create and manage your boxplots'
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
            classNames={{}}
            size="md"
            selectedKey={showPlotsManagement ? 'plot-management' : 'boxplot-creation'} // Updated key value
            onSelectionChange={onTabChange}
          >
            <Tab
              key="boxplot-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Create Boxplot</span>
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
                    />
                    <RadioGroup
                      orientation="horizontal"
                      value={hingeValue}
                      onValueChange={setHingeValue}
                      size="sm"
                    >
                      <Radio value="1.5">Hinge = 1.5</Radio>
                      <Radio value="3.0">Hinge = 3.0</Radio>
                    </RadioGroup>
                  </div>
                  <Spacer y={8} />
                  <CreateButton onClick={onCreateBoxplot} isDisabled={variables.length === 0}>
                    Create Boxplot
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
