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
import {setKeplerTableModal, setOpenFileModal, setGridView} from '../../actions';
import {GeoDaState} from 'webapp/src/store';

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

  const onToggleGridCallback = useCallback(
    (event: React.MouseEvent) => {
      setShowGridView(!showGridView);
      dispatch(setGridView(!showGridView));
    },
    [dispatch, showGridView]
  );

  return (
    <div className="toolbar">
      <GeoDaLogo className="logo-box" geodaLogoClassName="geo-da-logo-instance" />
      <div className="tool-box">
        <IconOpen className="icon-open-instance" onClick={onOpenCallback} />
        <IconTable className="icon-table-instance" onClick={onTableCallback} />
        <IconMap className="icon-map-instance" />
        <IconWeights className="icon-weights-instance" />
        <IconChoropleth className="design-component-instance-node" />
        <IconHistogram className="design-component-instance-node" />
        <IconBoxplot className="icon-boxplot-instance" />
        <IconScatterplot className="design-component-instance-node" />
        <IconCartogram className="icon-cartogram-instance" />
        <IconParallel className="icon-parallel-instance" />
        <IconLisa className="icon-lisa-instance" />
        <IconChatgpt className="design-component-instance-node" />
      </div>
      <div className="user-box">
        <div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" checked={showGridView} />
            <div onClick={onToggleGridCallback} className="w-6 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        <Avatar />
      </div>
    </div>
  );
}
