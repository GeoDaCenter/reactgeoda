import {useIntl} from 'react-intl';
import {Accordion, AccordionItem} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {useMemo} from 'react';

import {getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox, WarningType} from '../common/warning-box';
import {LocalMoranPanel} from './local-moran-panel';
import {accordionItemClasses} from '@/constants';
import {setPropertyPanel} from '@/actions';
import {PanelName} from '../panel/panel-container';
import {LocalGPanel} from './local-g-panel';
import {QuantileLisaPanel} from './quantile-lisa-panel';
import {LocalGearyPanel} from './local-geary-panel';

const NO_WEIGHTS_MESSAGE = 'Please create a spatial weights before running LISA analysis.';
const NO_MAP_LOADED_MESSAGE = 'Please load a map first before running LISA analysis.';

export function LisaPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  const weights = useSelector((state: GeoDaState) => state.root.weights);
  const layer = useSelector((state: GeoDaState) => getLayer(state));

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  const onNoWeightsMessageClick = () => {
    // dispatch to show weights panel
    dispatch(setPropertyPanel(PanelName.WEIGHTS));
  };

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
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : weights.length === 0 ? (
        <WarningBox
          message={NO_WEIGHTS_MESSAGE}
          type={WarningType.WARNING}
          onClick={onNoWeightsMessageClick}
        />
      ) : (
        <div className="h-full overflow-y-auto p-4">
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
            <AccordionItem key="2" aria-label="local-g" title="Local G" className="text-small">
              <LocalGPanel />
            </AccordionItem>
            <AccordionItem
              key="3"
              aria-label="local-gear"
              title="Local Geary"
              className="text-small"
            >
              <LocalGearyPanel />
            </AccordionItem>
            <AccordionItem
              key="4"
              aria-label="quantile-lisa"
              title="Quantile LISA"
              className="text-small"
            >
              <QuantileLisaPanel />
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </RightPanelContainer>
  );
}
