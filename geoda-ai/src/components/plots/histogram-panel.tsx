import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {VariableSelector} from '../common/variable-selector';
import {useState} from 'react';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before creating and managing your plots.';

export function HistogramPanel() {
  const intl = useIntl();

  // use state for variable
  const [, setVariable] = useState('');

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
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
        <>
          <VariableSelector setVariable={setVariable} />
        </>
      )}
    </RightPanelContainer>
  );
}
