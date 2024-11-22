import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Badge, Button, Tooltip, Avatar} from '@nextui-org/react';
import {Icon} from '@iconify/react';
import {GeoDaLogo} from './geoda-logo';
import {
  IconBoxplot,
  IconBubbleChart,
  IconHistogram,
  IconLisa,
  IconMap,
  IconOpen,
  IconParallel,
  IconScatterplot,
  IconTable,
  IconWeights,
  IconSpreg,
  IconSave,
  IconSpatialJoin,
  IconMoranScatterplot
} from './navitagor-icons';
import {
  setAddDatasetModal,
  setKeplerTableModal,
  setOpenFileModal,
  setPropertyPanel,
  setSaveProjectModal,
  setShowChatPanel
} from '@/actions';
import {GeoDaState} from '@/store';
import {PanelName} from '@/constants';
import {ThemeSwitcher} from '@/components/buttons/theme-switch';
import {DashboardSwitcher} from '@/components/buttons/dashboard-switch';
import {IconAddDataset} from '@/components/icons/add';

export function Navigator() {
  const dispatch = useDispatch();

  const uiState = useSelector((state: GeoDaState) => ({
    isFileLoaded: state.root.datasets?.length > 0,
    showOpenModal: state.root.uiState.openFileModal.showOpenFileModal,
    showSaveProjectModal: state.root.uiState.showSaveProjectModal,
    showAddDatasetModal: state.root.uiState.openFileModal.showAddDatasetModal,
    showChatPanel: state.root.uiState.showChatPanel
  }));

  const newItemCounts = useSelector((state: GeoDaState) => ({
    weights: state.root.weights.filter(weight => weight.isNew).length,
    histogram: state.root.plots.filter(plot => plot.isNew && plot.type === 'histogram').length,
    regression: state.root.regressions.filter(reg => reg.isNew).length,
    scatterplot: state.root.plots.filter(plot => plot.isNew && plot.type === 'scatter').length,
    bubbleChart: state.root.plots.filter(plot => plot.isNew && plot.type === 'bubble').length,
    boxplot: state.root.plots.filter(plot => plot.isNew && plot.type === 'boxplot').length,
    moranScatterplot: state.root.plots.filter(plot => plot.isNew && plot.type === 'moranscatter')
      .length
  }));

  const onOpenCallback = useCallback(
    (event: React.MouseEvent) => {
      // dispatch action to open modal, update redux state state.root.uiState.showOpenFileModal
      dispatch(setOpenFileModal(!uiState.showOpenModal));
      event.preventDefault();
      event.stopPropagation();
    },
    [dispatch, uiState.showOpenModal]
  );

  const onSaveCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setSaveProjectModal(!uiState.showSaveProjectModal));
      event.stopPropagation();
    },
    [dispatch, uiState.showSaveProjectModal]
  );

  const onAddCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setAddDatasetModal(!uiState.showAddDatasetModal));
      event.stopPropagation();
    },
    [dispatch, uiState.showAddDatasetModal]
  );

  const onTableCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setPropertyPanel(PanelName.TABLE));
      dispatch(setKeplerTableModal(true));
      event.stopPropagation();
    },
    [dispatch]
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
          dispatch(setShowChatPanel(!uiState.showChatPanel));
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
        case 'icon-scatterplot':
          dispatch(setPropertyPanel(PanelName.SCATTERPLOT));
          break;
        case 'icon-cartogram': // Maybe change this to BUBBLE chart ?
          dispatch(setPropertyPanel(PanelName.BUBBLE_CHART));
          break;
        case 'icon-boxplot':
          dispatch(setPropertyPanel(PanelName.BOXPLOT));
          break;
        case 'icon-spreg':
          dispatch(setPropertyPanel(PanelName.SPREG));
          break;
        case 'icon-pcp':
          dispatch(setPropertyPanel(PanelName.PARALLEL_COORDINATE));
          break;
        case 'icon-spatial-join':
          dispatch(setPropertyPanel(PanelName.SPATIAL_JOIN));
          break;
        case 'icon-moran-scatterplot':
          dispatch(setPropertyPanel(PanelName.MORAN_SCATTERPLOT));
          break;
      }
      event.stopPropagation();
    },
    [dispatch, uiState.showChatPanel]
  );

  const buttonClassName = 'bg-transparent active:outline-none active:ring-0';

  return (
    <div className="justify-top flex h-screen w-[48px] flex-col items-center bg-gradient-to-b from-amber-950 via-amber-900 to-gray-800">
      <GeoDaLogo />
      <div className="justify-top mt-4 flex w-full grow flex-col items-center">
        <Tooltip key="openFileTooltip" placement="right" content="Open File">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            onClick={onOpenCallback}
            isDisabled={uiState.isFileLoaded}
          >
            <IconOpen />
          </Button>
        </Tooltip>
        <Tooltip key="saveTooltip" placement="right" content="Save">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            isDisabled={!uiState.isFileLoaded}
            onClick={onSaveCallback}
          >
            <IconSave />
          </Button>
        </Tooltip>
        <Tooltip key="addFileTooltip" placement="right" content="Add Dataset">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            onClick={onAddCallback}
            isDisabled={!uiState.isFileLoaded}
          >
            <IconAddDataset />
          </Button>
        </Tooltip>
        <Tooltip key="tableTooltip" placement="right" content="Table">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            isDisabled={!uiState.isFileLoaded}
            onClick={onTableCallback}
          >
            <IconTable />
          </Button>
        </Tooltip>
        <Tooltip key="mappingTooltip" placement="right" content="Map">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            id="icon-mapping"
            onClick={onClickIconCallback}
            isDisabled={!uiState.isFileLoaded}
          >
            <IconMap />
          </Button>
        </Tooltip>
        <Badge
          color="danger"
          content={newItemCounts.weights}
          isInvisible={newItemCounts.weights === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="weightsTooltip" placement="right" content="Spatial Weights">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-weights"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconWeights />
            </Button>
          </Tooltip>
        </Badge>
        <Tooltip key="spatialJoinTooltip" placement="right" content="Spatial Join">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            id="icon-spatial-join"
            onClick={onClickIconCallback}
            isDisabled={!uiState.isFileLoaded}
          >
            <IconSpatialJoin />
          </Button>
        </Tooltip>
        {/* <Tooltip key="customMapTooltip" placement="right" content="Custom Map">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            id="icon-custom-map"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconChoropleth />
          </Button>
        </Tooltip> */}
        <Badge
          color="danger"
          content={newItemCounts.histogram}
          isInvisible={newItemCounts.histogram === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="histogramTooltip" placement="right" content="Histogram">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-histogram"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconHistogram />
            </Button>
          </Tooltip>
        </Badge>
        <Badge
          color="danger"
          content={newItemCounts.scatterplot}
          isInvisible={newItemCounts.scatterplot === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="scatterplotTooltip" placement="right" content="Scatter Plot">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-scatterplot"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconScatterplot />
            </Button>
          </Tooltip>
        </Badge>
        <Badge
          color="danger"
          content={newItemCounts.boxplot}
          isInvisible={newItemCounts.boxplot === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="boxplotTooltip" placement="right" content="Box Plot">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-boxplot"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconBoxplot />
            </Button>
          </Tooltip>
        </Badge>
        <Badge
          color="danger"
          content={newItemCounts.bubbleChart}
          isInvisible={newItemCounts.bubbleChart === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="cartogramTooltip" placement="right" content="BubbleChart">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-cartogram"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconBubbleChart />
            </Button>
          </Tooltip>
        </Badge>
        <Tooltip key="pcpTooltip" placement="right" content="Parallel Coordinate Plot">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            id="icon-pcp"
            onClick={onClickIconCallback}
            isDisabled={!uiState.isFileLoaded}
          >
            <IconParallel />
          </Button>
        </Tooltip>
        <Badge
          color="danger"
          content={newItemCounts.moranScatterplot}
          isInvisible={newItemCounts.moranScatterplot === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="moran-scatterplotTooltip" placement="right" content="Moran Scatter Plot">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-moran-scatterplot"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconMoranScatterplot />
            </Button>
          </Tooltip>
        </Badge>
        <Tooltip
          key="lisaTooltip"
          placement="right"
          content="Local Indicators of Spatial Autocorrelation"
        >
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            id="icon-lisa"
            onClick={onClickIconCallback}
            isDisabled={!uiState.isFileLoaded}
          >
            <IconLisa />
          </Button>
        </Tooltip>
        <Badge
          color="danger"
          content={newItemCounts.regression}
          isInvisible={newItemCounts.regression === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="spregTooltip" placement="right" content="Spatial Regression">
            <Button
              isIconOnly
              size="sm"
              className={buttonClassName}
              id="icon-spreg"
              onClick={onClickIconCallback}
              isDisabled={!uiState.isFileLoaded}
            >
              <IconSpreg />
            </Button>
          </Tooltip>
        </Badge>
      </div>
      <div className="justify-top mb-4 mt-4 flex w-full flex-none flex-col items-center gap-2">
        <Tooltip key="chatgptTooltip" placement="right" content="GeoDa.AI ChatBot">
          <Button
            isIconOnly
            size="sm"
            className={buttonClassName}
            id="icon-chatgpt"
            onClick={onClickIconCallback}
            isDisabled={!uiState.isFileLoaded}
          >
            <Icon icon="hugeicons:ai-chat-02" width={24} style={{color: '#fff'}} />
          </Button>
        </Tooltip>
        <DashboardSwitcher isDisabled={!uiState.isFileLoaded} />
        <ThemeSwitcher />
        <Button
          isIconOnly
          size="sm"
          className={buttonClassName}
          id="icon-settings"
          onClick={onClickIconCallback}
        >
          <Avatar showFallback src="" className="mt-2 h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
