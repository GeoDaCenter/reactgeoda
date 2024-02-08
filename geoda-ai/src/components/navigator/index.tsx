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
    <div className="justify-top flex h-screen w-[48px] flex-col items-center bg-amber-950">
      <GeoDaLogo className="flex-none" />
      <div className="justify-top mt-4 flex w-full grow flex-col items-center gap-2">
        <IconOpen onClick={onOpenCallback} isEnabled={!isFileLoaded} />
        <IconTable isEnabled={isFileLoaded} onClick={onTableCallback} />
        <IconMap isEnabled={isFileLoaded} onClick={onClickIconCallback} />
        <Badge
          color="danger"
          content={newWeightsCount}
          isInvisible={newWeightsCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
          className="absolute left-0"
        >
          <IconWeights onClick={onClickIconCallback} isEnabled={isFileLoaded} />
        </Badge>
        <IconChoropleth isEnabled={isFileLoaded} />
        <Badge
          color="danger"
          content={newHistogramCount}
          isInvisible={newHistogramCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
          className="absolute left-0"
        >
          <IconHistogram onClick={onClickIconCallback} isEnabled={isFileLoaded} />
        </Badge>
        <IconBoxplot />
        <IconScatterplot />
        <IconCartogram />
        <IconParallel />
        <IconLisa isEnabled={isFileLoaded} onClick={onClickIconCallback} />
        <IconChatgpt onClick={onClickIconCallback} />
      </div>
      <div className="user-box flex-none">
        <DashboardSwitcher />
        <ThemeSwitcher />
        <Avatar onClick={onClickIconCallback} />
      </div>
    </div>
  );
}
