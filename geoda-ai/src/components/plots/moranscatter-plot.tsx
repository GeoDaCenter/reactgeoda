import React, {useRef, useMemo, useState} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
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
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import {CanvasRenderer} from 'echarts/renderers';
import {getScatterChartOption} from '@/utils/plots/scatterplot-utils';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {selectKeplerDataset} from '@/store/selectors';
import {ChartInsightButton} from '../common/chart-insight';
import {MoranScatterPlotStateProps} from '@/reducers/plot-reducer';
import {spatialLag} from 'geoda-wasm';
import {standardize} from '@/utils/math-utils';

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

export const MoranScatterPlot = ({props}: {props: MoranScatterPlotStateProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  const {id, datasetId, variable, weightsId} = props;

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));
  const selectedWeights = useSelector((state: GeoDaState) =>
    state.root.weights.find(w => w.weightsMeta.id === weightsId)
  );

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    const data = getColumnDataFromKeplerDataset(variable, keplerDataset);
    const x = standardize(data);
    const y = selectedWeights?.weights ? spatialLag(x, selectedWeights.weights) : [];
    const showRegressionLine = true;
    return getScatterChartOption(variable, x, 'spatial lag', y, showRegressionLine);
  }, [keplerDataset, variable, selectedWeights]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(params, dispatch, datasetId, id, eChartsRef.current?.getEchartsInstance());
      }
    }),
    [dispatch, datasetId, id]
  );

  const title = `Moran's I Scatter Plot: ${variable}`;
  const chartId = `moran-scatterplot-${id}`;

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="h-full w-full" shadow="none" id={chartId}>
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">{title}</p>
                <small className="text-default-500">{keplerDataset.label}</small>
                <ChartInsightButton parentElementId={chartId} />
              </CardHeader>
              <CardBody className="py-2">
                <ReactEChartsCore
                  echarts={echarts}
                  option={option}
                  notMerge={true}
                  lazyUpdate={false}
                  theme={theme}
                  onEvents={bindEvents}
                  style={{height: '100%', width: '100%'}}
                  ref={eChartsRef}
                  onChartReady={() => {
                    setRendered(true);
                  }}
                />
                {rendered && sourceId && sourceId !== id && (
                  <EChartsUpdater dataId={datasetId} eChartsRef={eChartsRef} />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [
      chartId,
      title,
      keplerDataset.label,
      option,
      theme,
      bindEvents,
      rendered,
      sourceId,
      id,
      datasetId
    ]
  );
};
