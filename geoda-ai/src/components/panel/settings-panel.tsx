import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';

import {setOpenAIKey} from '../../actions';
import '../../styles/settings-panel.css';

export function SettingsPanel() {
  const dispatch = useDispatch();

  // declare state openAIKey
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  const onOpenAIKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const key = event.target.value;
      // dispatch action to update redux state state.root.uiState.openAIKey
      dispatch(setOpenAIKey(key));
    },
    [dispatch, openAIKey]
  );

  return (
    <div className="settings-panel">
      <div className="modal-header">
        <div className="content">
          <div className="text-and-supporting">
            <div className="text">Settings</div>
            <div className="supporting-text">Change your personal settings</div>
          </div>
        </div>
        <div className="padding-bottom" />
      </div>
      <div className="form-wrapper">
        <div className="form">
          <div className="div">
            <div className="div">
              <div className="label">ChatGPT API Key</div>
              <div className="input">
                <input
                  type="text"
                  onChange={onOpenAIKeyChange}
                  className="inputToken"
                  value={openAIKey || ''}
                />
              </div>
            </div>
            <p className="hint-text">You can get your API key from openai.com.</p>
          </div>
        </div>
      </div>
      <div className="padding-bottom" />
      <div className="modal-actions">
        <div className="content-3">
          <button className="button">
            <div className="text-confirm">Confirm</div>
          </button>
          <button className="cancel-button">
            <div className="text-cancel">Cancel</div>
          </button>
        </div>
      </div>
    </div>
  );
}
