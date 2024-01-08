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
import {
  setKeplerTableModal,
  setOpenFileModal,
  setGridView,
  setShowPropertyPanel
} from '../../actions';
import {GeoDaState} from '../../store';

export function Navigator() {
  const dispatch = useDispatch();

  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);
  const showKeplerTableModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showKeplerTableModal
  );
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
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

  const onChatGPTCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setShowPropertyPanel(!showPropertyPanel));
      event.stopPropagation();
    },
    [dispatch, showPropertyPanel]
  );

  const onToggleGridCallback = useCallback(() => {
    setShowGridView(!showGridView);
    dispatch(setGridView(!showGridView));
  }, [dispatch, showGridView]);

  return (
    <div className="toolbar">
      <GeoDaLogo className="logo-box" geodaLogoClassName="geo-da-logo-instance" />
      <div className="tool-box">
        <IconOpen className="icon-open-instance cursor-pointer" onClick={onOpenCallback} />
        <IconTable className="icon-table-instance cursor-pointer" onClick={onTableCallback} />
        <IconMap className="icon-map-instance" />
        <IconWeights className="icon-weights-instance" />
        <IconChoropleth className="design-component-instance-node" />
        <IconHistogram className="design-component-instance-node" />
        <IconBoxplot className="icon-boxplot-instance" />
        <IconScatterplot className="design-component-instance-node" />
        <IconCartogram className="icon-cartogram-instance" />
        <IconParallel className="icon-parallel-instance" />
        <IconLisa className="icon-lisa-instance" />
        <IconChatgpt
          className="design-component-instance-node cursor-pointer"
          onClick={onChatGPTCallback}
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
            <div className="peer h-4 w-6 rounded-full bg-gray-200 after:absolute after:start-[0px] after:top-[2px] after:h-3 after:w-3 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"></div>
          </label>
        </div>
        <Avatar />
      </div>
    </div>
  );
}
