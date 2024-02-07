import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Badge} from '@nextui-org/react';

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
import {ThemeSwitcher} from '../buttons/theme-switch';
import {DashboardSwitcher} from '../buttons/bashboard-switch';

export function Navigator() {
  const dispatch = useDispatch();

  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);

  const fileName = useSelector((state: GeoDaState) => state.root.file.rawFileData?.name);

  const [isFileLoaded, setIsFileLoaded] = useState(Boolean(fileName));

  // monitor fileName and set isFileLoaded state
  useEffect(() => {
    setIsFileLoaded(Boolean(fileName));
  }, [fileName]);

  const showKeplerTableModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showKeplerTableModal
  );

  // get number of newly added weights from state.root.weights
  const newWeightsCount = useSelector(
    (state: GeoDaState) => state.root.weights.filter(weight => weight.isNew).length
  );

  // get number of newly added plots from state.root.plots
  const newHistogramCount = useSelector(
    (state: GeoDaState) =>
      state.root.plots.filter(plot => plot.isNew && plot.type === 'histogram').length
  );

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
        case 'icon-lisa':
          dispatch(setPropertyPanel(PanelName.LISA));
          break;
        case 'icon-histogram':
          dispatch(setPropertyPanel(PanelName.HISTOGRAM));
          break;
      }
      event.stopPropagation();
    },
    [dispatch]
  );

  return (
    <div className="toolbar">
      <GeoDaLogo className="logo-box" geodaLogoClassName="geo-da-logo-instance" />
      <div className="tool-box">
        <IconOpen
          className="icon-open-instance cursor-pointer"
          onClick={onOpenCallback}
          isEnabled={!isFileLoaded}
        />
        <IconTable
          className="icon-table-instance cursor-pointer"
          isEnabled={isFileLoaded}
          onClick={onTableCallback}
        />
        <IconMap
          className="icon-map-instance cursor-pointer"
          isEnabled={isFileLoaded}
          onClick={onClickIconCallback}
        />
        <Badge
          color="danger"
          content={newWeightsCount}
          isInvisible={newWeightsCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
          className="absolute left-0"
        >
          <IconWeights
            className="icon-weights-instance cursor-pointer"
            onClick={onClickIconCallback}
            isEnabled={isFileLoaded}
          />
        </Badge>
        <IconChoropleth className="design-component-instance-node" isEnabled={isFileLoaded} />
        <Badge
          color="danger"
          content={newHistogramCount}
          isInvisible={newHistogramCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
          className="absolute left-0"
        >
          <IconHistogram
            className="design-component-instance-node cursor-pointer"
            onClick={onClickIconCallback}
            isEnabled={isFileLoaded}
          />
        </Badge>
        <IconBoxplot className="icon-boxplot-instance" />
        <IconScatterplot className="design-component-instance-node" />
        <IconCartogram className="icon-cartogram-instance" />
        <IconParallel className="icon-parallel-instance" />
        <IconLisa
          className="icon-lisa-instance cursor-pointer"
          isEnabled={isFileLoaded}
          onClick={onClickIconCallback}
        />
        <IconChatgpt
          className="design-component-instance-node cursor-pointer"
          onClick={onClickIconCallback}
        />
      </div>
      <div className="user-box">
        <DashboardSwitcher />
        <ThemeSwitcher />
        <Avatar onClick={onClickIconCallback} />
      </div>
    </div>
  );
}
