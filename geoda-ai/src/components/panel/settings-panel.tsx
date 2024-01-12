import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';

import {setOpenAIKey} from '../../actions';
import '../../styles/settings-panel.css';
import {RightPanelContainer} from '../common/right-panel-template';
import {useIntl} from 'react-intl';

export function SettingsPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // define state openAIKey
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  // define useState for key
  const [key, setKey] = React.useState(openAIKey || '');

  const onOpenAIKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const keyValue = event.target.value;
      setKey(keyValue);
      // dispatch action to update redux state state.root.uiState.openAIKey
      dispatch(setOpenAIKey(keyValue));
    },
    [dispatch]
  );

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'settings.title',
        defaultMessage: 'Settings'
      })}
      description={intl.formatMessage({
        id: 'settings.description',
        defaultMessage: 'Change your personal settings'
      })}
    >
      <div className="form">
        <div className="div">
          <div className="div">
            <div className="label">ChatGPT API Key</div>
            <div className="input">
              <input
                type="text"
                onChange={onOpenAIKeyChange}
                className="inputToken"
                value={key || ''}
              />
            </div>
          </div>
          <p className="hint-text">You can get your API key from openai.com.</p>
        </div>
      </div>
      <div className="padding-bottom" />
      <div className="bottom-buttons">
        <div className="two-buttons-container">
          <button className="confirm-button">
            <div className="text-confirm">Confirm</div>
          </button>
          <button className="cancel-button">
            <div className="text-cancel">Cancel</div>
          </button>
        </div>
      </div>
    </RightPanelContainer>
  );
}
