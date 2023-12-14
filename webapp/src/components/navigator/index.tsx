import React, {useCallback} from 'react';
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
import {setKeplerTableModal, setOpenFileModal} from '../../actions';
import {GeoDaState} from 'webapp/src/store';

export function Navigator() {
  const dispatch = useDispatch();

  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);
  const showKeplerTableModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showKeplerTableModal
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
        <Avatar />
      </div>
    </div>
  );
}
