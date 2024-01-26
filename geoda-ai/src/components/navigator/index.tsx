import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Avatar} from './avatar';
import {GeoDaLogo} from './geoda-logo';
import {
  IconBoxplot,
  IconCartogram,
  IconChatgpt,
  IconChoropleth,
  IconHistogram,
  IconLisa,
  IconMap,
  IconOpen,
  IconParallel,
  IconScatterplot,
  IconTable,
  IconWeights
} from './icons';
import {setGridView, setKeplerTableModal, setOpenFileModal, setPropertyPanel} from '../../actions';
import {GeoDaState} from '../../store';
import {PanelName} from '../panel/panel-container';

export function Navigator() {
  const dispatch = useDispatch();

  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);
  const showKeplerTableModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showKeplerTableModal
  );
  const [showGridView, setShowGridView] = useState(false);

  const onOpenCallback = useCallback(
    (event: React.MouseEvent) => {
      // dispatch action to open modal, update redux state state.root.uiState.showOpenFileModal
      dispatch(setOpenFileModal(!showOpenModal));
      event.preventDefault();
      event.stopPropagation();
    },
    [dispatch, showOpenModal]
  );

  const onTableCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setKeplerTableModal(!showKeplerTableModal));
      event.stopPropagation();
    },
    [dispatch, showKeplerTableModal]
  );

  const onClickIconCallback = useCallback(
    (event: React.MouseEvent) => {
      const targetId = event.currentTarget.id;
      switch (targetId) {
        case 'icon-weights':
          dispatch(setPropertyPanel(PanelName.WEIGHTS));
          break;
        case 'icon-mapping':
          dispatch(setPropertyPanel(PanelName.MAPPING));
          break;
        case 'icon-chatgpt':
          dispatch(setPropertyPanel(PanelName.CHAT_GPT));
          break;
        case 'icon-settings':
          dispatch(setPropertyPanel(PanelName.SETTINGS));
          break;
      }
      event.stopPropagation();
    },
    [dispatch]
  );

  const onToggleGridCallback = useCallback(() => {
    setShowGridView(!setShowGridView);
    dispatch(setGridView(!setShowGridView));
  }, [dispatch]);

  return (
    <div className="toolbar">
      <GeoDaLogo className="logo-box" geodaLogoClassName="geo-da-logo-instance" />
      <div className="tool-box">
        <IconOpen className="icon-open-instance cursor-pointer" onClick={onOpenCallback} />
        <IconTable className="icon-table-instance cursor-pointer" onClick={onTableCallback} />
        <IconMap className="icon-map-instance cursor-pointer" onClick={onClickIconCallback} />
        <IconWeights
          className="icon-weights-instance cursor-pointer"
          onClick={onClickIconCallback}
        />
        <IconChoropleth className="design-component-instance-node" />
        <IconHistogram className="design-component-instance-node" />
        <IconBoxplot className="icon-boxplot-instance" />
        <IconScatterplot className="design-component-instance-node" />
        <IconCartogram className="icon-cartogram-instance" />
        <IconParallel className="icon-parallel-instance" />
        <IconLisa className="icon-lisa-instance" />
        <IconChatgpt
          className="design-component-instance-node cursor-pointer"
          onClick={onClickIconCallback}
        />
      </div>
      <div className="user-box">
        <div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              value=""
              className="peer sr-only"
              checked={showGridView}
              onChange={onToggleGridCallback}
            />
            <div className="dark:border-gray-600·dark:bg-gray-700·dark:peer-focus:ring-blue-800·rtl:peer-checked:after:-translate-x-full peer h-4 w-6 rounded-full bg-gray-200 after:absolute after:start-[0px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300"></div>
          </label>
        </div>
        <Avatar onClick={onClickIconCallback} />
      </div>
    </div>
  );
}
