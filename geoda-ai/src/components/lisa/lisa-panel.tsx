import {useIntl} from 'react-intl';
import {Card, CardBody, Tab, Tabs} from '@nextui-org/react';
import {useSelector} from 'react-redux';

import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {LocalMoranPanel} from './local-moran-panel';
import {LocalGPanel} from './local-g-panel';
import {QuantileLisaPanel} from './quantile-lisa-panel';
import {LocalGearyPanel} from './local-geary-panel';
import {datasetsSelector} from '@/store/selectors';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before running LISA analysis.';

export function LisaPanel() {
  const intl = useIntl();
  const datasets = useSelector(datasetsSelector);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'lisa.title',
        defaultMessage: 'Local Spatial Autocorrelation'
      })}
      description={intl.formatMessage({
        id: 'lisa.description',
        defaultMessage: 'Apply local spatial autocorrelation analysis'
      })}
    >
      {datasets.length === 0 ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            <Tabs aria-label="Options" variant="light" color="danger" classNames={{}} size="md">
              <Tab
                key="local-moran"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Local Moran</span>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <LocalMoranPanel />
                  </CardBody>
                </Card>
              </Tab>
              <Tab
                key="local-g"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Local G</span>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <LocalGPanel />
                  </CardBody>
                </Card>
              </Tab>
              <Tab
                key="local-geary"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Local Geary</span>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <LocalGearyPanel />
                  </CardBody>
                </Card>
              </Tab>
              <Tab
                key="quantile-lisa"
                title={
                  <div className="flex items-center space-x-2">
                    <span>Quantile LISA</span>
                  </div>
                }
              >
                <Card>
                  <CardBody>
                    <QuantileLisaPanel />
                  </CardBody>
                </Card>
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
    </RightPanelContainer>
  );
}
