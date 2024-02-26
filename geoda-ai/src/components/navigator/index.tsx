import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Badge, Button, Tooltip, Avatar} from '@nextui-org/react';

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
import {setKeplerTableModal, setOpenFileModal, setPropertyPanel} from '../../actions';
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
        case 'icon-boxplot':
          dispatch(setPropertyPanel(PanelName.BOXPLOT));
          break;
      }
      event.stopPropagation();
    },
    [dispatch]
  );

  return (
    <div className="justify-top flex h-screen w-[48px] flex-col items-center bg-amber-950">
      <GeoDaLogo />
      <div className="justify-top mt-4 flex w-full grow flex-col items-center">
        <Tooltip key="openFileTooltip" placement="right" content="Open File">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            onClick={onOpenCallback}
            isDisabled={isFileLoaded}
          >
            <IconOpen />
          </Button>
        </Tooltip>
        <Tooltip key="tableTooltip" placement="right" content="Table">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            isDisabled={!isFileLoaded}
            onClick={onTableCallback}
          >
            <IconTable />
          </Button>
        </Tooltip>
        <Tooltip key="mappingTooltip" placement="right" content="Map">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-mapping"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconMap />
          </Button>
        </Tooltip>
        <Badge
          color="danger"
          content={newWeightsCount}
          isInvisible={newWeightsCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="weightsTooltip" placement="right" content="Spatial Weights">
            <Button
              isIconOnly
              size="sm"
              className="bg-transparent"
              id="icon-weights"
              onClick={onClickIconCallback}
              isDisabled={!isFileLoaded}
            >
              <IconWeights />
            </Button>
          </Tooltip>
        </Badge>
        <Tooltip key="customMapTooltip" placement="right" content="Custom Map">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-custom-map"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconChoropleth />
          </Button>
        </Tooltip>
        <Badge
          color="danger"
          content={newHistogramCount}
          isInvisible={newHistogramCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="histogramTooltip" placement="right" content="Histogram">
            <Button
              isIconOnly
              size="sm"
              className="bg-transparent"
              id="icon-histogram"
              onClick={onClickIconCallback}
              isDisabled={!isFileLoaded}
            >
              <IconHistogram />
            </Button>
          </Tooltip>
        </Badge>
        <Tooltip key="boxplotTooltip" placement="right" content="Box Plot">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-boxplot"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconBoxplot />
          </Button>
        </Tooltip>
        <Tooltip key="scatterTooltip" placement="right" content="Scatter Plot">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-scatterplot"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconScatterplot />
          </Button>
        </Tooltip>
        <Tooltip key="cartogramTooltip" placement="right" content="Cartogram">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-cartogram"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconCartogram />
          </Button>
        </Tooltip>
        <Tooltip key="pcpTooltip" placement="right" content="Parallel Coordinate Plot">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-pcp"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconParallel />
          </Button>
        </Tooltip>
        <Tooltip
          key="lisaTooltip"
          placement="right"
          content="Local Indicators of Spatial Autocorrelation"
        >
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-lisa"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconLisa />
          </Button>
        </Tooltip>
        <Tooltip key="chatgptTooltip" placement="right" content="GeoDa.AI ChatBot">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-chatgpt"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconChatgpt />
          </Button>
        </Tooltip>
      </div>
      <div className="justify-top mb-4 mt-4 flex w-full flex-none flex-col items-center gap-2">
        <DashboardSwitcher />
        <ThemeSwitcher />
        <Button
          isIconOnly
          size="sm"
          className="bg-transparent"
          id="icon-settings"
          onClick={onClickIconCallback}
        >
          <Avatar showFallback src="" className="mt-2 h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
