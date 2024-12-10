import React, {useRef, useMemo, useState} from 'react';
import {LineChart, ScatterChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {
  TooltipComponent,
  GridComponent,
  BrushComponent,
  ToolboxComponent
} from 'echarts/components';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {CanvasRenderer} from 'echarts/renderers';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {selectKeplerDataset} from '@/store/selectors';
import {SimpleScatterPlotStateProps} from '@/reducers/plot-reducer';
import {getSimpleScatterChartOption} from '@/utils/plots/simple-scatterplot-utils';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent,
  LineChart
]);

export const SimpleScatterPlot = ({props}: {props: SimpleScatterPlotStateProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  const {id: parentId, datasetId, variableX, variableY} = props;
  const id = parentId + '-simple-scatter-plot';

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const {xData, yData} = useMemo(() => {
    const xData = getColumnDataFromKeplerDataset(variableX, keplerDataset);
    const yData = getColumnDataFromKeplerDataset(variableY, keplerDataset);
    return {xData, yData};
  }, [keplerDataset, variableX, variableY]);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getSimpleScatterChartOption(variableX, xData, variableY, yData);
  }, [variableX, variableY, xData, yData]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(params, dispatch, datasetId, id, eChartsRef.current?.getEchartsInstance());
      }
    }),
    [dispatch, datasetId, id]
  );

  return (
    <div className="h-full w-full">
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        notMerge={true}
        lazyUpdate={false}
        theme={theme}
        onEvents={bindEvents}
        style={{height: '100%', width: '100%', opacity: '0.5'}}
        ref={eChartsRef}
        onChartReady={() => {
          setRendered(true);
        }}
      />
      {rendered && sourceId && sourceId !== id && (
        <EChartsUpdater dataId={datasetId} eChartsRef={eChartsRef} />
      )}
    </div>
  );
};
