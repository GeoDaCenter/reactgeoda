import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {VariableSelector} from '../common/variable-selector';
import {ChangeEvent, useEffect, useState} from 'react';
import {Button, Card, CardBody, Chip, Input, Spacer, Tab, Tabs} from '@nextui-org/react';
import {MAP_ID} from '@/constants';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {createHistogram} from '@/utils/plots/histogram-utils';
import {PlotProps, addPlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {generateRandomId} from '@/utils/ui-utils';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function HistogramPanel() {
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch();

  // use state for variable
  const [variable, setVariable] = useState('');
  // use state for intervals
  const [intervals, setIntervals] = useState(7);
  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );
  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // on intervals change
  const onIntervalsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIntervals(parseInt(e.target.value, 10));
  };

  // on create histogram
  const onCreateHistogram = () => {
    // get data from variable
    const data = getColumnData(variable, dataContainer);
    const histogram = createHistogram(data, 7);
    // generate random id for histogram
    const id = generateRandomId();
    // dispatch action to create histogram and add to store
    dispatch(addPlot({id, type: 'histogram', variable, data: histogram}));
    // Show the plots management panel
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

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'plot.histogram.title',
        defaultMessage: 'Histogram'
      })}
      description={intl.formatMessage({
        id: 'plot.histogram.description',
        defaultMessage: 'Create and manage your histograms'
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
            selectedKey={showPlotsManagement ? 'plot-management' : 'histogram-creation'}
            onSelectionChange={key => setShowPlotsManagement(key === 'plot-management')}
          >
            <Tab
              key="histogram-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Create Histogram</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-2">
                    <VariableSelector setVariable={setVariable} />
                    <Input
                      type="number"
                      label="Intervals in histogram"
                      value={`${intervals}`}
                      onChange={onIntervalsChange}
                      min={1}
                    />
                  </div>
                  <Spacer y={8} />
                  <Button
                    onClick={onCreateHistogram}
                    radius="sm"
                    color="primary"
                    className="bg-rose-900"
                    disabled={variable === '' || intervals <= 0}
                  >
                    Create Histogram
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
