import {useIntl} from 'react-intl';
import {Accordion, AccordionItem} from '@nextui-org/react';
import {useSelector} from 'react-redux';
import {useMemo} from 'react';

import {getNumericFieldNames} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {LocalMoranPanel, accordionItemClasses} from './local-moran-panel';

const NO_WEIGHTS_MESSAGE = 'Please create a spatial weights matrix before running LISA analysis.';
const NO_MAP_LOADED_MESSAGE = 'Please load a map first before running LISA analysis.';

export function LisaPanel() {
  const intl = useIntl();

  const geodaState = useSelector((state: GeoDaState) => state);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
  const weights = useSelector((state: GeoDaState) => state.root.weights);

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(tableName, geodaState.keplerGl[MAP_ID].visState);
    return fieldNames;
  }, [geodaState.keplerGl, tableName]);

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
      {numericColumns.length === 0 ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : weights.length === 0 ? (
        <WarningBox message={NO_WEIGHTS_MESSAGE} type="warning" />
      ) : (
        <div className="p-4">
          <Accordion
            variant="splitted"
            className="max-w text-small"
            itemClasses={accordionItemClasses}
          >
            <AccordionItem
              key="1"
              aria-label="lisa-parameters"
              title="Local Moran"
              className="text-small"
            >
              <LocalMoranPanel />
            </AccordionItem>
            <AccordionItem
              key="2"
              aria-label="local-g"
              title="Local G"
              className="text-small"
            ></AccordionItem>
            <AccordionItem
              key="3"
              aria-label="local-gear"
              title="Local Geary"
              className="text-small"
            ></AccordionItem>
            <AccordionItem
              key="4"
              aria-label="quantile-lisa"
              title="Quantile LISA"
              className="text-small"
            ></AccordionItem>
          </Accordion>
        </div>
      )}
    </RightPanelContainer>
  );
}
