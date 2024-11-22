import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import dynamic from 'next/dynamic';
import {Icon} from '@iconify/react';

import {GeoDaState} from '../../store';
import {SettingsPanel} from './settings-panel';
import {setShowPropertyPanel} from '@/actions';

import {WeightsPanel} from '../weights/weights-panel';
import {LisaPanel} from '../lisa/lisa-panel';
import {HistogramPanel} from '../plots/histogram-panel';
import {BoxplotPanel} from '../plots/boxplot-panel';
import {ParallelCoordinatePanel} from '../plots/parallel-coordinate-panel';
import {SpregPanel} from '../spreg/spreg-panel';
import {ScatterplotPanel} from '../plots/scatterplot-panel';
import {BubbleChartPanel} from '../plots/bubble-chart-panel';
import {DashboardPanel} from '../dashboard/dashboard-panel';
import {Splitter} from '../common/splitter';
import {DEFAULT_PANEL_WIDTH, PanelName} from '@/constants';
import {SpatialJoinPanel} from '../spatial-operations/spatial-join-panel';
import {Button} from '@nextui-org/react';
import {MoranScatterPanel} from '../plots/moranscatter-panel';

const TablePanel = dynamic(() => import('../table/table-panel'), {ssr: false});
const MappingPanel = dynamic(() => import('../mapping/mapping-panel'), {ssr: false});

export const PanelContainer = () => {
  const dispatch = useDispatch();

  const [panelWidth, setPanelWidth] = React.useState<number>(DEFAULT_PANEL_WIDTH);

  // get showGridView from redux state
  const showPropertyPanel = useSelector(
    (state: GeoDaState) => state.root.uiState.showPropertyPanel
  );

  // get panel name
  const propertyPanelName = useSelector(
    (state: GeoDaState) => state.root.uiState.propertyPanelName
  );

  const onCloseClick = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setShowPropertyPanel(false));
      event.preventDefault();
      event.stopPropagation();
    },
    [dispatch]
  );

  return showPropertyPanel ? (
    <div
      className="relative flex h-screen flex-row bg-gray-50 dark:bg-stone-900"
      style={{width: panelWidth}}
    >
      <Splitter
        mode="horizontal"
        initialSize={panelWidth}
        onSplitterChange={setPanelWidth}
        minimumSize={DEFAULT_PANEL_WIDTH}
      />
      <div className="relative flex flex-grow flex-col">
        <Button
          className="absolute right-1 top-1 z-10"
          isIconOnly={true}
          variant="light"
          size="sm"
          onClick={onCloseClick}
        >
          <Icon icon="system-uicons:window-collapse-left" width={18} />
        </Button>
        <div className="h-full" style={{width: `${panelWidth}px`}}>
          {propertyPanelName === PanelName.SETTINGS && <SettingsPanel />}
          {propertyPanelName === PanelName.MAPPING && <MappingPanel />}
          {propertyPanelName === PanelName.WEIGHTS && <WeightsPanel />}
          {propertyPanelName === PanelName.LISA && <LisaPanel />}
          {propertyPanelName === PanelName.HISTOGRAM && <HistogramPanel />}
          {propertyPanelName === PanelName.BOXPLOT && <BoxplotPanel />}
          {propertyPanelName === PanelName.PARALLEL_COORDINATE && <ParallelCoordinatePanel />}
          {propertyPanelName === PanelName.SPREG && <SpregPanel />}
          {propertyPanelName === PanelName.SCATTERPLOT && <ScatterplotPanel />}
          {propertyPanelName === PanelName.BUBBLE_CHART && <BubbleChartPanel />}
          {propertyPanelName === PanelName.DASHBOARD && <DashboardPanel />}
          {propertyPanelName === PanelName.TABLE && <TablePanel />}
          {propertyPanelName === PanelName.SPATIAL_JOIN && <SpatialJoinPanel />}
          {propertyPanelName === PanelName.MORAN_SCATTERPLOT && <MoranScatterPanel />}
        </div>
      </div>
    </div>
  ) : null;
};
