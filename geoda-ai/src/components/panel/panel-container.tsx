import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import dynamic from 'next/dynamic';
import {GeoDaState} from '../../store';
import {SettingsPanel} from './settings-panel';
import {IconXClose} from '../icons/xclose';
import '../../styles/settings-panel.css';
import { setShowPropertyPanel } from '@/actions';

const ChatGPTPanel = dynamic(() => import('../chatgpt/chatgpt-wrapper'), {ssr: false});

// define enum for panel names
export enum PanelName {
  CHAT_GPT = 'ChatGpt',
  SETTINGS = 'Settings'
}

export const PanelContainer = () => {
  const dispatch = useDispatch();

  // get showGridView from redux state
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );

  // get panel name
  const propertyPanelName = useSelector(
    (state: GeoDaState) => state.root.uiState.propertyPanelName
  );

  const onCloseClick = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setShowPropertyPanel(false));
      event.preventDefault();
      event.stopPropagation();
    },
    [dispatch]
  );

  return showPropertyPanel ? (
    <div className="prop-box">
      <div className="prop-box-close" onClick={onCloseClick}>
        <IconXClose className="x-close" />
      </div>
      <div className="prop-box-content">
        {propertyPanelName === PanelName.CHAT_GPT && <ChatGPTPanel />}
        {propertyPanelName === PanelName.SETTINGS && <SettingsPanel />}
      </div>
    </div>
  ) : null;
};
