import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {MultiVariableSelector} from '../common/multivariable-selector';
import {Key, useEffect, useState} from 'react';
import {Button, Card, CardBody, Chip, Spacer, Tab, Tabs} from '@nextui-org/react';
import {MAP_ID} from '@/constants';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {createBoxplot} from '@/utils/boxplot-utils';
import {CreateParallelCoordinateProps} from '@/utils/parallel-coordinate-utils';
import {PlotProps, addPlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function ParallelCoordinatePanel() {
  // Updated function name
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch();

  // use state for variable
  const [variables, setVariables] = useState<string[]>([]);

  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // on create boxplot // Updated function name
  const onCreateBoxplot = () => {
    // Updated function name
    console.log('Create boxplot'); // Updated log message
    // get data from variable
    const data: CreateParallelCoordinateProps['data'] = variables.reduce(
      (prev: CreateParallelCoordinateProps['data'], cur: string) => {
        const values = getColumnData(cur, dataContainer);
        prev[cur] = values;
        return prev;
      },
      {}
    );

    // get hinge value as number
    const boundIQR = parseFloat('1');
    const boxplot = createBoxplot({data, boundIQR});
    // generate random id for boxplot
    const id = Math.random().toString(36).substring(7);
    // dispatch action to create boxplot and add to store
    dispatch(addPlot({id, type: 'parallel-coordinate', variables}));
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

  // monitor state.root.plots, if plots.length changed, update the tab title
  const plotsLength = plots?.length;
  useEffect(() => {
    if (plotsLength) {
      setShowPlotsManagement(true);
    }
  }, [plotsLength]);

  const onTabChange = (key: Key) => {
    if (key === 'parallel-coordinate-creation') {
      // Updated key value
      setShowPlotsManagement(false);
    } else {
      setShowPlotsManagement(true);
    }
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'plot.parallel-coordinate.title',
        defaultMessage: 'Parallel Coordinate'
      })}
      description={intl.formatMessage({
        id: 'plot.parallel-coordinate.description',
        defaultMessage: 'Create and manage your parallel coordinates'
      })}
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
            classNames={{}}
            size="md"
            selectedKey={showPlotsManagement ? 'plot-management' : 'parallel-coordinate-creation'} // Updated key value
            onSelectionChange={onTabChange}
          >
            <Tab
              key="parallel-coordinate-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Create Parallel Coordinate</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4 text-sm">
                    <MultiVariableSelector setVariables={setVariables} />
                  </div>
                  <Spacer y={8} />
                  <Button
                    onClick={onCreateBoxplot}
                    radius="sm"
                    color="primary"
                    className="bg-rose-900"
                    disabled={variables.length === 0}
                  >
                    Create Parallel Coordinate
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
