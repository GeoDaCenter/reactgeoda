import React from 'react';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';

import {IconXClose} from '../icons/xclose';
import "../../styles/settings-panel.css";

export const SettingsPanel = (): JSX.Element => {
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
        <div className="button-close-x">
          <IconXClose className="x-close" />
        </div>
      </div>
      <div className="form-wrapper">
        <div className="form">
          <div className="div">
            <div className="div">
              <div className="label">ChatGPT API Key</div>
              <div className="input">
                <input type="text" name="name" className="inputToken" />
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
};
