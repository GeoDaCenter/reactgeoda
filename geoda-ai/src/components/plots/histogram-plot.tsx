import AutoSizer from 'react-virtualized-auto-sizer';
import {HistogramPlotProps} from '@/actions/plot-actions';
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
import {getHistogramChartOption} from '@/utils/plots/histogram-utils';
import {geodaBrushLink} from '@/actions';
import {getDataset} from '@/utils/data-utils';

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

type EChartsUpdaterProps = {
  dataId: string;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: HistogramPlotProps;
  getChartOption: (filteredIndex: number[] | null, props: HistogramPlotProps) => any;
};

const EChartsUpdater = ({dataId, eChartsRef, props, getChartOption}: EChartsUpdaterProps) => {
  const filteredIndexes = useSelector(
    (state: GeoDaState) => state.root.interaction?.brushLink?.[dataId]
  );

  // get dataset from store
  const dataset = useSelector((state: GeoDaState) => getDataset(state));
  const numberOfRows = dataset?.dataContainer.numRows() || 0;

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (eChartsRef.current && filteredIndexes) {
      const updatedOption = getHistogramChartOption(filteredIndexes, props);
      const chart = eChartsRef.current;
      if (chart && filteredIndexes.length < numberOfRows) {
        const chartInstance = chart.getEchartsInstance();
        chartInstance.setOption(updatedOption, true);
      }
    }
  }, [eChartsRef, filteredIndexes, getChartOption, numberOfRows, props]);

  return null;
};

/**
 * The react component of a histogram plot using Nivo bar chart
 */
export const HistogramPlot = ({props}: {props: HistogramPlotProps}) => {
  const dispatch = useDispatch();

  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.dataId) || '';
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getHistogramChartOption(null, props);
  }, [props]);

  const bindEvents = useMemo(() => {
    return {
      rendered: function () {
        setRendered(true);
      },
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
          brushed.length > 0
            ? brushed.map((idx: number) => props.data[idx].items.map(item => item.index)).flat()
            : [];

        // check if this plot is in state.plots
        if (brushed.length === 0) {
          // reset options
          const chart = eChartsRef.current;
          if (chart) {
            const chartInstance = chart.getEchartsInstance();
            const updatedOption = getHistogramChartOption(null, props);
            chartInstance.setOption(updatedOption);
          }
        }
        // Dispatch action to highlight selected in other components
        dispatch(geodaBrushLink({sourceId: props.id, dataId, filteredIndex}));
      }
    };
  }, [dataId, dispatch, props]);

  // get reference of echarts
  const eChartsRef = useRef<ReactEChartsCore>(null);

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="h-full w-full" shadow="none">
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">{props.type}</p>
                <small className="text-default-500">{props.variable}</small>
              </CardHeader>
              <CardBody className="py-2">
                <ReactEChartsCore
                  echarts={echarts}
                  option={option}
                  notMerge={true}
                  lazyUpdate={true}
                  theme={theme}
                  // onChartReady={this.onChartReadyCallback}
                  onEvents={bindEvents}
                  // opts={}
                  style={{height: '100%', width: '100%'}}
                  ref={eChartsRef}
                />
                {rendered && sourceId && sourceId !== props.id && (
                  <EChartsUpdater
                    dataId={dataId}
                    eChartsRef={eChartsRef}
                    props={props}
                    getChartOption={getHistogramChartOption}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [bindEvents, dataId, option, props, rendered, sourceId, theme]
  );
};
