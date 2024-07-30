import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {VariableSelector} from '../common/variable-selector';
import {ChangeEvent, useEffect, useState} from 'react';
import {Card, CardBody, Chip, Input, Spacer, Tab, Tabs} from '@nextui-org/react';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {createHistogram} from '@/utils/plots/histogram-utils';
import {PlotProps, addPlot} from '@/actions/plot-actions';
import {PlotManagementPanel} from './plot-management';
import {generateRandomId} from '@/utils/ui-utils';
import {CreateButton} from '../common/create-button';
import {defaultDatasetIdSelector, selectKeplerDataset} from '@/store/selectors';
import {DatasetSelector} from '../common/dataset-selector';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function HistogramPanel() {
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch();

  // use state for variable
  const [variable, setVariable] = useState('');
  // use state for intervals
  const [intervals, setIntervals] = useState(7);

  const defaultDatasetId = useSelector(defaultDatasetIdSelector);
  const keplerDataset = useSelector(selectKeplerDataset(defaultDatasetId));
  const [datasetId, setDatasetId] = useState(keplerDataset?.id || '');

  // use selector to get plots
  const plots = useSelector((state: GeoDaState) => state.root.plots);

  // on intervals change
  const onIntervalsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIntervals(parseInt(e.target.value, 10));
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

  // on create histogram
  const onCreateHistogram = () => {
    if (keplerDataset) {
      // get data from variable
      const data = getColumnDataFromKeplerDataset(variable, keplerDataset);
      const histogram = createHistogram(data, 7);
      // generate random id for histogram
      const id = generateRandomId();
      // dispatch action to create histogram and add to store
      dispatch(addPlot({id, datasetId, type: 'histogram', variable, data: histogram}));
      // Show the plots management panel
      setShowPlotsManagement(true);
    }
  };

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
      {!keplerDataset ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full w-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="danger"
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
                    <DatasetSelector datasetId={datasetId} setDatasetId={setDatasetId} />
                    <VariableSelector dataId={datasetId} setVariable={setVariable} />
                    <Input
                      type="number"
                      label="Intervals in histogram"
                      value={`${intervals}`}
                      onChange={onIntervalsChange}
                      min={1}
                    />
                  </div>
                  <Spacer y={8} />
                  <CreateButton
                    onClick={onCreateHistogram}
                    isDisabled={variable === '' || intervals <= 0}
                  >
                    Create Histogram
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
