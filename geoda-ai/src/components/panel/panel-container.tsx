import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import dynamic from 'next/dynamic';

import {GeoDaState} from '../../store';
import {SettingsPanel} from './settings-panel';
import {IconXClose} from '../icons/xclose';
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
import {DEFAULT_PANEL_WIDTH} from '@/constants';

const ChatGPTPanel = dynamic(() => import('../chatgpt/chatgpt-panel'), {ssr: false});
const TablePanel = dynamic(() => import('../table/table-panel'), {ssr: false});
const MappingPanel = dynamic(() => import('../mapping/mapping-panel'), {ssr: false});

// define enum for panel names
export enum PanelName {
  CHAT_GPT = 'ChatGpt',
  SETTINGS = 'Settings',
  TABLE = 'Table',
  MAPPING = 'Mapping',
  WEIGHTS = 'Weights',
  LISA = 'Lisa',
  HISTOGRAM = 'Histogram',
  SCATTERPLOT = 'Scatterplot',
  BOXPLOT = 'Boxplot',
  SPREG = 'Spatial Regression',
  PARALLEL_COORDINATE = 'Parallel Coordinate',
  BUBBLE_CHART = 'Bubble Chart',
  DASHBOARD = 'Dashboard'
}

export const PanelContainer = ({onStartCapture, screenshot}: {onStartCapture: () => null, screenshot?: string}) => {
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
      className="relative flex h-screen flex-row bg-gray-50 dark:bg-gray-900"
      style={{width: panelWidth}}
    >
      <Splitter
        mode="horizontal"
        initialSize={panelWidth}
        onSplitterChange={setPanelWidth}
        minimumSize={DEFAULT_PANEL_WIDTH}
      />
      <div className="flex flex-grow flex-col">
        <div className="absolute right-2 top-2 z-[99] cursor-pointer" onClick={onCloseClick}>
          <IconXClose />
        </div>
        <div className="h-full" style={{width: `${panelWidth}px`}}>
          {propertyPanelName === PanelName.CHAT_GPT && (
            <ChatGPTPanel onStartCapture={onStartCapture} screenshot={screenshot} />
          )}
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
        </div>
      </div>
    </div>
  ) : null;
};
