import {HistogramPlotProps} from '@/actions/plot-actions';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
import {EChartsOption} from 'echarts';
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
import {GeojsonLayer, Layer} from '@kepler.gl/layers';
import {Filter} from '@kepler.gl/types';

import {HistogramDataItemProps, HistogramDataProps} from '@/utils/histogram-utils';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {RefObject, useEffect, useMemo, useRef} from 'react';

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

const defaultBarColors = ['#FF6B6B', '#48BB78', '#4299E1', '#ED64A6', '#F6E05E'];

function getChartOption(filteredIndex: Uint8ClampedArray | null, props: HistogramPlotProps) {
  // check if there is highlighted from layer by checking if filteredIndex has any 0
  const hasHighlighted = filteredIndex && filteredIndex.some((idx: number) => idx === 0);

  // build highlighted bars from filteredIndex and filteredIndexDict
  const highlightedBars = props.data.map((d: HistogramDataProps, i: number) => {
    const highlightedIds = d.items.reduce((acc: number[], d: HistogramDataItemProps) => {
      if (filteredIndex && filteredIndex[d.index] === 1) {
        acc.push(d.index);
      }
      return acc;
    }, []);
    return {
      value: hasHighlighted ? highlightedIds?.length : 0,
      itemStyle: {
        color: defaultBarColors[i % defaultBarColors.length],
        opacity: 1
      },
      label: `[${d.binStart.toFixed(1)} - ${d.binEnd.toFixed(1)}]`,
      // ids that associated with the bar and been filtered
      ids: hasHighlighted ? highlightedIds : 0
    };
  });

  // get plotData from props.data
  const plotData: HistogramDataProps[] = props.data;

  // use binStart values as the x axis tick values
  // const xTickValues = plotData.map((d: HistogramDataProps) => d.binStart.toFixed(1));

  // get min value from plotData
  const minValue = plotData[0].binStart;
  const maxValue = plotData[plotData.length - 1].binEnd;
  const numBins = plotData.length;
  const interval = (maxValue - minValue) / numBins;

  // get bar data from plotData
  const barData = plotData.map((d: HistogramDataProps, i: number) => {
    return {
      value: hasHighlighted ? d.count - highlightedBars[i].value : d.count,
      itemStyle: {
        color: defaultBarColors[i % defaultBarColors.length],
        opacity: hasHighlighted ? 0.5 : 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      label: `[${d.binStart.toFixed(1)} - ${d.binEnd.toFixed(1)}]`,
      // ids that associated with the bar and been filtered
      ids: d.items.map((d: HistogramDataItemProps) => d.index)
    };
  });

  const series = [
    {
      data: highlightedBars,
      type: 'bar',
      barWidth: '90%',
      stack: 'total',
      xAxisIndex: 0
    },
    {
      data: barData,
      type: 'bar',
      barWidth: '90%',
      stack: 'total',
      xAxisIndex: 0,
      label: {
        show: false,
        position: [0, -15],
        formatter: function (params: {value: any}) {
          return params.value; //display series name
        }
      }
    }
  ];

  // build option for echarts
  const option: EChartsOption = {
    xAxis: [
      {
        type: 'category',
        // data: xTickValues,
        // axisLabel: {
        //   interval: 0,
        //   hideOverlap: true
        // },
        // axisTick: {
        //   alignWithLabel: false,
        //   interval: 0
        // },
        axisTick: {show: false},
        axisLabel: {show: false},
        axisLine: {show: false},
        position: 'bottom'
      },
      {
        scale: true,
        type: 'value',
        min: minValue,
        max: maxValue,
        interval: interval,
        axisLabel: {
          hideOverlap: true,
          rotate: 35,
          overflow: 'truncate',
          formatter: function (d: any) {
            return `${d.toFixed(1)}`;
          }
        },
        splitLine: {
          show: false
        },
        position: 'bottom'
      }
    ],
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (d: any) {
          return `${d}`;
        }
      },
      splitLine: {
        show: true
      }
    },
    // @ts-ignore
    series,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        // ids that associated with the bar
        const range = params[1].data.label;
        const count = params[1].value;
        return `Range: ${range}<br/> # Observations: ${count}`;
      }
    },
    brush: {
      toolbox: ['rect', 'keep', 'clear'],
      xAxisIndex: 0
    },
    grid: [
      {
        left: '3%',
        right: '5%',
        top: '20%',
        bottom: '0%',
        containLabel: true,
        height: 'auto'
      }
    ]
  };
  console.log('getChartOption', option);
  return option;
}

type EChartsUpdaterProps = {
  filteredIndex: Uint8ClampedArray | null;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: HistogramPlotProps;
  getChartOption: (filteredIndex: Uint8ClampedArray | null, props: HistogramPlotProps) => any;
};

const EChartsUpdater = ({
  filteredIndex,
  eChartsRef,
  props,
  getChartOption
}: EChartsUpdaterProps) => {
  // use selector to get filteredIndexTrigger
  // const filteredIndexTrigger = useSelector((state: GeoDaState) => {
  //   const layer: GeojsonLayer = state.keplerGl[MAP_ID].visState.layers.find((layer: Layer) =>
  //     tableName.startsWith(layer.config.label)
  //   );
  //   return layer.filteredIndexTrigger;
  // });

  // use selector to get filters with type === 'polygon'
  const polygonFilter = useSelector((state: GeoDaState) => {
    const polyFilter = state.keplerGl[MAP_ID].visState.filters.find(
      (f: Filter) => f.type === 'polygon' && f.enabled === true
    );
    return polyFilter?.value?.geometry;
  });

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (eChartsRef.current && polygonFilter) {
      console.log('EChartsUpdater setOption');
      const updatedOption = getChartOption(filteredIndex, props);
      const chart = eChartsRef.current;
      if (chart) {
        const chartInstance = chart.getEchartsInstance();
        // chartInstance.dispatchAction({type: 'brush', command: 'clear', areas: []});
        chartInstance.setOption(updatedOption, true);
      }
    }
  }, [eChartsRef, filteredIndex, getChartOption, polygonFilter, props]);

  return null;
};

/**
 * The react component of a histogram plot using Nivo bar chart
 */
export const HistogramPlot = ({props}: {props: HistogramPlotProps}) => {
  const dispatch = useDispatch();

  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // use selector to get layer using tableName as layer.label
  const filteredIndex = useSelector((state: GeoDaState) => {
    const layer: GeojsonLayer = state.keplerGl[MAP_ID].visState.layers.find((layer: Layer) =>
      tableName.startsWith(layer.config.label)
    );
    return layer.filteredIndex;
  });

  // use selector to check if plot is in state
  const validPlot = useSelector((state: GeoDaState) =>
    state.root.plots.find(p => p.id === props.id)
  );

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getChartOption(filteredIndex, props);
  }, [filteredIndex, props]);

  const bindEvents = {
    // click: function (params: any) {
    //   console.log('click', params);
    //   const ids = params.data.ids;
    //   // dispatch action to highlight the selected ids
    //   dispatch({
    //     type: 'SET_FILTER_INDEXES',
    //     payload: {dataLabel: tableName, filteredIndex: ids}
    //   });
    // },
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

      console.log('brushSelected', brushed);
      // check if this plot is in state.plots
      if (validPlot && brushed.length === 0) {
        // reset options
        const chart = eChartsRef.current;
        if (chart) {
          const chartInstance = chart.getEchartsInstance();
          const updatedOption = getChartOption(null, props);
          chartInstance.setOption(updatedOption);
        }
      }
      // dispatch action to highlight the selected ids
      dispatch({
        type: 'SET_FILTER_INDEXES',
        payload: {dataLabel: tableName, filteredIndex: validPlot ? filteredIndex : null}
      });
    }
    // brushEnd: function (params: any) {
    //   console.log('brushEnd');
    // }
  };

  // get reference of echarts
  const eChartsRef = useRef<ReactEChartsCore>(null);

  return (
    <Card className="py-4">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-tiny font-bold uppercase">{props.type}</p>
        <small className="text-default-500">{props.variable}</small>
      </CardHeader>
      <CardBody className="w-full py-2">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          // theme={'theme_name'}
          // onChartReady={this.onChartReadyCallback}
          onEvents={bindEvents}
          // opts={}
          style={{height: '200px', width: '100%'}}
          ref={eChartsRef}
        />
        {validPlot && (
          <EChartsUpdater
            filteredIndex={filteredIndex}
            eChartsRef={eChartsRef}
            props={props}
            getChartOption={getChartOption}
          />
        )}
      </CardBody>
    </Card>
  );
};
