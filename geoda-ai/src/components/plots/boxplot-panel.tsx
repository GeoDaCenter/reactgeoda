import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {MultiVariableSelector} from '../common/multivariable-selector';
import {Key, useEffect, useState} from 'react';
import {
  Button,
  Card,
  CardBody,
  Chip,
  Spacer,
  Tab,
  Tabs,
  RadioGroup,
  Radio
} from '@nextui-org/react';
import {MAP_ID} from '@/constants';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {CreateBoxplotProps, createBoxplot} from '@/utils/boxplot-utils'; // Updated import
import {PlotProps, addPlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function BoxplotPanel() {
  // Updated function name
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch();

  // use state for variable
  const [variables, setVariables] = useState<string[]>([]);
  // useState for hingeValue
  const [hingeValue, setHingeValue] = useState('1.5');

  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // on create boxplot // Updated function name
  const onCreateBoxplot = () => {
    // Updated function name
    // get data from variable
    const data: CreateBoxplotProps['data'] = variables.reduce(
      (prev: CreateBoxplotProps['data'], cur: string) => {
        const values = getColumnData(cur, dataContainer);
        prev[cur] = values;
        return prev;
      },
      {}
    );

    // get hinge value as number
    const boundIQR = parseFloat(hingeValue);
    const boxplot = createBoxplot({data, boundIQR});
    // generate random id for boxplot
    const id = Math.random().toString(36).substring(7);
    // dispatch action to create boxplot and add to store
    dispatch(addPlot({id, type: 'boxplot', variables, data: boxplot}));
    // show plots management tab
    setShowPlotsManagement(true);
  };

  // check if there is any newly added plots, if there is, show plots management tab
  const newPlotsCount = plots.filter((plot: PlotProps) => plot.isNew).length;
  const [showPlotsManagement, setShowPlotsManagement] = useState(newPlotsCount > 0);

  // reset isNew flag of plots
  useEffect(() => {
    if (newPlotsCount > 0) {
      plots.forEach((plot: PlotProps) => {
        if (plot.isNew) {
          plot.isNew = false;
        }
      });
    }
  }, [newPlotsCount, plots]);

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
      {!tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
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
                    <MultiVariableSelector setVariables={setVariables} />
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
                  <Button
                    onClick={onCreateBoxplot}
                    radius="sm"
                    color="primary"
                    className="bg-rose-900"
                    disabled={variables.length === 0}
                  >
                    Create Boxplot
                  </Button>
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
