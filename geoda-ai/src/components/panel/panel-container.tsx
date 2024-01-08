import React from 'react';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {ChatGptComponent} from '../chatgpt/chatgpt-wrapper';
import {SettingsPanel} from './settings-panel';
import {IconXClose} from '../icons/xclose';
import '../../styles/settings-panel.css';

export const PanelContainer = () => {
  // get showGridView from redux state
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );

  const showChatGPTPanel = true;
  const showSettingsPanel = false;

  return showPropertyPanel ? (
    <div className="prop-box">
      <div className="button-close-x">
        <IconXClose className="x-close" />
      </div>
      <div className="prop-box-content">
        {showChatGPTPanel && <ChatGptComponent />}
        {showSettingsPanel && <SettingsPanel />}
      </div>
    </div>
  ) : null;
};
