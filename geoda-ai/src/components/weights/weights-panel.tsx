import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';

const NO_MAP_LOADED_MESSAGE =
  'Please load a map first before creating and managing spatial weights.';

export function WeightsPanel() {
  const intl = useIntl();
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'weights.title',
        defaultMessage: 'Spatial Weights'
      })}
      description={intl.formatMessage({
        id: 'weights.description',
        defaultMessage: 'Create and manage spatial weights'
      })}
    >
      {!tableName ? <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" /> : <></>}
    </RightPanelContainer>
  );
}
