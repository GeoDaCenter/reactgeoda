import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {VariableSelector} from '../common/variable-selector';
import {useState} from 'react';
import {Button, Card, CardBody, Input, Spacer, Tab, Tabs} from '@nextui-org/react';
import {MAP_ID} from '@/constants';
import {getColumnDataFromKeplerLayer} from '@/utils/data-utils';
import {createHistogram} from '@/utils/histogram-utils';
import {HistogramPlot} from './histogram-plot';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function HistogramPanel() {
  const intl = useIntl();

  // use state for variable
  const [variable, setVariable] = useState('');
  // use state for intervals
  const [intervals, setIntervals] = useState(7);

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // use selector to get visState
  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState);

  // on create histogram
  const onCreateHistogram = () => {
    console.log('Create histogram');
    // get data from variable
    const data = getColumnDataFromKeplerLayer(tableName, variable, visState);
    const hist = createHistogram(data, 7);
    // dispatch action to create histogram and add to store
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
      {!tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <Tabs aria-label="Options" variant="solid" color="warning" classNames={{}} size="md">
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
                  <Input type="number" label="Intervals in histogram" value={`${intervals}`} />
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
              </div>
            }
          >
            <HistogramPlot />
          </Tab>
        </Tabs>
      )}
    </RightPanelContainer>
  );
}
