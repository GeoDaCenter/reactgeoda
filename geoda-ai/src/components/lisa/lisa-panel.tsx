import {useIntl} from 'react-intl';
import {RightPanelContainer} from '../common/right-panel-template';

export function LisaPanel() {
  const intl = useIntl();

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
      <></>
    </RightPanelContainer>
  );
}
