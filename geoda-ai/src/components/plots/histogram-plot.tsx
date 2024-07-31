import AutoSizer from 'react-virtualized-auto-sizer';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
// Import charts, all with Chart suffix
import {
  // LineChart,
  BarChart
  // PieChart,
  // ScatterChart,
  // RadarChart,
  // MapChart,
  // TreeChart,
  // TreemapChart,
  // GraphChart,
  // GaugeChart,
  // FunnelChart,
  // ParallelChart,
  // SankeyChart,
  // BoxplotChart,
  // CandlestickChart,
  // EffectScatterChart,
  // LinesChart,
  // HeatmapChart,
  // PictorialBarChart,
  // ThemeRiverChart,
  // SunburstChart,
  // CustomChart,
} from 'echarts/charts';
// import components, all suffixed with Component
import {
  // GridSimpleComponent,
  GridComponent,
  // PolarComponent,
  // RadarComponent,
  // GeoComponent,
  // SingleAxisComponent,
  // ParallelComponent,
  // CalendarComponent,
  // GraphicComponent,
  ToolboxComponent,
  TooltipComponent,
  // AxisPointerComponent,
  BrushComponent,
  TitleComponent
  // TimelineComponent,
  // MarkPointComponent,
  // MarkLineComponent,
  // MarkAreaComponent,
  // LegendComponent,
  // LegendScrollComponent,
  // LegendPlainComponent,
  // DataZoomComponent,
  // DataZoomInsideComponent,
  // DataZoomSliderComponent,
  // VisualMapComponent,
  // VisualMapContinuousComponent,
  // VisualMapPiecewiseComponent,
  // AriaComponent,
  // TransformComponent,
  // DatasetComponent
} from 'echarts/components';
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer
  // SVGRenderer,
} from 'echarts/renderers';
import {useDispatch, useSelector} from 'react-redux';

import {GeoDaState} from '@/store';
import {RefObject, useEffect, useMemo, useRef, useState} from 'react';
import {getHistogramChartOption, HistogramDataProps} from '@/utils/plots/histogram-utils';
import {geodaBrushLink} from '@/actions';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {selectKeplerDataset} from '@/store/selectors';
import {ChartInsightButton} from '../common/chart-insight';
import {HistogramPlotStateProps} from '@/reducers/plot-reducer';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  BrushComponent,
  GridComponent,
  BarChart,
  CanvasRenderer
]);

type ChartsUpdaterProps = {
  dataId: string;
  eChartsRef: RefObject<ReactEChartsCore>;
  histogramData: HistogramDataProps[];
  barDataIndexes: number[][];
  getChartOption: typeof getHistogramChartOption;
};

const ChartsUpdater = ({
  dataId,
  eChartsRef,
  histogramData,
  barDataIndexes,
  getChartOption
}: ChartsUpdaterProps) => {
  const filteredIndexes = useSelector(
    (state: GeoDaState) => state.root.interaction?.brushLink?.[dataId]
  );

  // get dataset from store
  const dataset = useSelector(selectKeplerDataset(dataId));
  const numberOfRows = dataset?.length || 0;

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (eChartsRef.current && filteredIndexes) {
      const updatedOption = getHistogramChartOption(filteredIndexes, histogramData, barDataIndexes);
      const chart = eChartsRef.current;
      if (chart && filteredIndexes.length < numberOfRows) {
        const chartInstance = chart.getEchartsInstance();
        chartInstance.setOption(updatedOption, true);
      }
    }
  }, [barDataIndexes, eChartsRef, filteredIndexes, getChartOption, histogramData, numberOfRows]);

  return null;
};

/**
 * The react component of a histogram plot using Nivo bar chart
 */
export const HistogramPlot = ({props}: {props: HistogramPlotStateProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);

  const [rendered, setRendered] = useState(false);

  const {id, datasetId, variable, data: histogramData} = props;

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  // use selector to get source id
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  // use selector to get keplerDataset
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  // get data from variable
  const rawData = useMemo(
    () => getColumnDataFromKeplerDataset(variable, keplerDataset),
    [keplerDataset, variable]
  );

  // get indexes of data items for each bar
  const barDataIndexes = useMemo(
    () =>
      histogramData.map((d: HistogramDataProps) => {
        const indexes = [];
        for (let i = 0; i < rawData.length; i++) {
          const value = rawData[i];
          if (value >= d.binStart && value < d.binEnd) {
            indexes.push(i);
          }
        }
        return indexes;
      }),
    [histogramData, rawData]
  );

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getHistogramChartOption(null, histogramData, barDataIndexes);
  }, [histogramData, barDataIndexes]);

  // bind events for brush selection in eCharts Histogram
  const bindEvents = useMemo(() => {
    return {
      brushSelected: function (params: any) {
        const brushed = [];
        const brushComponent = params.batch[0];

        for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
          const rawIndices = brushComponent.selected[sIdx].dataIndex;
          // merge rawIndices to brushed
          brushed.push(...rawIndices);
        }

        // get selected ids from brushed bars
        const filteredIndex =
          brushed.length > 0 ? brushed.map((idx: number) => barDataIndexes[idx]).flat() : [];

        // check if this plot is in state.plots
        if (brushed.length === 0) {
          // reset options
          const chart = eChartsRef.current;
          if (chart) {
            const chartInstance = chart.getEchartsInstance();
            const updatedOption = getHistogramChartOption(null, histogramData, barDataIndexes);
            chartInstance.setOption(updatedOption);
          }
        }
        // Dispatch action to highlight selected in other components
        dispatch(geodaBrushLink({sourceId: id, dataId: datasetId, filteredIndex}));
      }
    };
  }, [barDataIndexes, datasetId, dispatch, histogramData, id]);

  // generate a unique id for the chart
  const chartId = `histogram-${id}`;

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="h-full w-full" shadow="none" id={chartId}>
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">{variable}</p>
                <small className="truncate text-default-500">{keplerDataset.label}</small>
                <ChartInsightButton parentElementId={chartId} />
              </CardHeader>
              <CardBody className="py-2">
                <ReactEChartsCore
                  echarts={echarts}
                  option={option}
                  notMerge={true}
                  lazyUpdate={true}
                  theme={theme}
                  onEvents={bindEvents}
                  style={{height: '100%', width: '100%'}}
                  ref={eChartsRef}
                  onChartReady={() => {
                    setRendered(true);
                  }}
                />
                {rendered && sourceId && sourceId !== id && (
                  <ChartsUpdater
                    dataId={datasetId}
                    eChartsRef={eChartsRef}
                    histogramData={histogramData}
                    barDataIndexes={barDataIndexes}
                    getChartOption={getHistogramChartOption}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [
      barDataIndexes,
      bindEvents,
      chartId,
      datasetId,
      histogramData,
      id,
      keplerDataset.label,
      option,
      rendered,
      sourceId,
      theme,
      variable
    ]
  );
};
