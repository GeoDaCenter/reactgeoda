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
  IconSpatialJoin
} from './navitagor-icons';
import {
  setAddDatasetModal,
  setKeplerTableModal,
  setOpenFileModal,
  setPropertyPanel,
  setSaveProjectModal,
  setShowChatPanel
} from '../../actions';
import {GeoDaState} from '../../store';
import {PanelName} from '../panel/panel-container';
import {ThemeSwitcher} from '../buttons/theme-switch';
import {DashboardSwitcher} from '../buttons/dashboard-switch';
import {IconAddDataset} from '../icons/add';

export function Navigator() {
  const dispatch = useDispatch();

  const showOpenModal = useSelector((state: GeoDaState) => state.root.uiState.showOpenFileModal);
  const showSaveProjectModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showSaveProjectModal
  );
  const showAddDatasetModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showAddDatasetModal
  );
  const isFileLoaded = useSelector((state: GeoDaState) => state.root.datasets?.length > 0);

  const showKeplerTableModal = useSelector(
    (state: GeoDaState) => state.root.uiState.showKeplerTableModal
  );

  const showChatPanel = useSelector((state: GeoDaState) => state.root.uiState.showChatPanel);

  // get number of newly added weights from state.root.weights
  const newWeightsCount = useSelector(
    (state: GeoDaState) => state.root.weights.filter(weight => weight.isNew).length
  );

  // get number of newly added plots from state.root.plots
  const newHistogramCount = useSelector(
    (state: GeoDaState) =>
      state.root.plots.filter(plot => plot.isNew && plot.type === 'histogram').length
  );

  // get number of newly added regressions from state.root.regressions
  const newRegressionCount = useSelector(
    (state: GeoDaState) => state.root.regressions.filter(reg => reg.isNew).length
  );

  // get number of newly added scatterplots from state.root.plots
  const newScatterplotCount = useSelector(
    (state: GeoDaState) =>
      state.root.plots.filter(plot => plot.isNew && plot.type === 'scatter').length
  );

  // get number of newly added bubble charts from state.root.plots
  const newBubbleChartCount = useSelector(
    (state: GeoDaState) =>
      state.root.plots.filter(plot => plot.isNew && plot.type === 'bubble').length
  );

  // get number of newly added boxplots from state.root.plots
  const newBoxplotCount = useSelector(
    (state: GeoDaState) =>
      state.root.plots.filter(plot => plot.isNew && plot.type === 'boxplot').length
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

  const onSaveCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setSaveProjectModal(!showSaveProjectModal));
      event.stopPropagation();
    },
    [dispatch, showSaveProjectModal]
  );

  const onAddCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setAddDatasetModal(!showAddDatasetModal));
      event.stopPropagation();
    },
    [dispatch, showAddDatasetModal]
  );

  const onTableCallback = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setPropertyPanel(PanelName.TABLE));
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
          dispatch(setShowChatPanel(!showChatPanel));
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
      }
      event.stopPropagation();
    },
    [dispatch, showChatPanel]
  );

  return (
    <div className="justify-top flex h-screen w-[48px] flex-col items-center bg-gradient-to-b from-amber-950 via-danger-100 to-secondary-100">
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
        <Tooltip key="saveTooltip" placement="right" content="Save">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            isDisabled={!isFileLoaded}
            onClick={onSaveCallback}
          >
            <IconSave />
          </Button>
        </Tooltip>
        <Tooltip key="addFileTooltip" placement="right" content="Add Dataset">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            onClick={onAddCallback}
            isDisabled={!isFileLoaded}
          >
            <IconAddDataset />
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
        <Tooltip key="spatialJoinTooltip" placement="right" content="Spatial Join">
          <Button
            isIconOnly
            size="sm"
            className="bg-transparent"
            id="icon-spatial-join"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <IconSpatialJoin />
          </Button>
        </Tooltip>
        {/* <Tooltip key="customMapTooltip" placement="right" content="Custom Map">
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
        </Tooltip> */}
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
        <Badge
          color="danger"
          content={newScatterplotCount}
          isInvisible={newScatterplotCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="scatterplotTooltip" placement="right" content="Scatter Plot">
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
        </Badge>
        <Badge
          color="danger"
          content={newBoxplotCount}
          isInvisible={newBoxplotCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
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
        </Badge>
        <Badge
          color="danger"
          content={newBubbleChartCount}
          isInvisible={newBubbleChartCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="cartogramTooltip" placement="right" content="BubbleChart">
            <Button
              isIconOnly
              size="sm"
              className="bg-transparent"
              id="icon-cartogram"
              onClick={onClickIconCallback}
              isDisabled={!isFileLoaded}
            >
              <IconBubbleChart />
            </Button>
          </Tooltip>
        </Badge>
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
        <Badge
          color="danger"
          content={newRegressionCount}
          isInvisible={newRegressionCount === 0}
          size="sm"
          placement="bottom-right"
          isOneChar
        >
          <Tooltip key="spregTooltip" placement="right" content="Spatial Regression">
            <Button
              isIconOnly
              size="sm"
              className="bg-transparent"
              id="icon-spreg"
              onClick={onClickIconCallback}
              isDisabled={!isFileLoaded}
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
            className="bg-transparent"
            id="icon-chatgpt"
            onClick={onClickIconCallback}
            isDisabled={!isFileLoaded}
          >
            <Icon icon="hugeicons:ai-chat-02" width={24} />
          </Button>
        </Tooltip>
        <DashboardSwitcher isDisabled={!isFileLoaded} />
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
