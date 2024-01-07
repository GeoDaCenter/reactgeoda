import React from 'react';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {ChatGptComponent} from '../chatgpt/chatgpt-wrapper';

export const PanelContainer = () => {
  // get showGridView from redux state
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );

  const showChatGPTPanel = true;

  return showPropertyPanel ? (
    <div className="prop-box">{showChatGPTPanel && <ChatGptComponent />}</div>
  ) : null;
};
