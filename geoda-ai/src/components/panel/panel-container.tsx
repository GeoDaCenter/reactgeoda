import React from 'react';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';

export const PanelContainer = () => {
  // get showGridView from redux state
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );

  return showPropertyPanel ? <div className="prop-box" /> : null;
};
