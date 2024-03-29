import {RefObject, useEffect, useMemo, useRef} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
import {EChartsOption} from 'echarts';
// Import charts, all with Chart suffix
import {BoxplotChart, ScatterChart} from 'echarts/charts';
// import components, all suffixed with Component
import {
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
  BrushComponent,
  TitleComponent,
  DataZoomComponent,
  DataZoomInsideComponent
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {useDispatch, useSelector} from 'react-redux';
import {Filter} from '@kepler.gl/types';

import {BoxplotDataProps} from '@/utils/boxplot-utils';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {BoxPlotProps} from '@/actions/plot-actions';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  BrushComponent,
  GridComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  BoxplotChart,
  ScatterChart,
  CanvasRenderer
]);

function getChartOption(
  filteredIndex: Uint8ClampedArray | null,
  props: BoxPlotProps,
  rawDataArray?: number[][]
) {
  // check if there is highlighted from layer by checking if filteredIndex has any 0
  // const hasHighlighted =
  //   filteredIndex && filteredIndex.some((idx: number) => idx === 0) && filteredIndex.length > 1;

  // build highlighted bars from filteredIndex and filteredIndexDict

  // get plotData from props.data
  const plotData: BoxplotDataProps = props.data;

  // build scatter plot data using rawData in the form of [0, value]
  const pointsData = rawDataArray?.map(
    (rawData, dataIndex) => rawData?.map((value: number) => [value, dataIndex]) || []
  );

  // build mean point
  const meanPoint = plotData.meanPoint.map((mp, dataIndex) => [mp[1], dataIndex]);

  const scatterSeries =
    pointsData?.map(data => ({
      type: 'scatter',
      data,
      symbolSize: 6,
      itemStyle: {
        color: 'lightblue'
      }
    })) || [];

  const series = [
    ...scatterSeries,
    {
      type: 'boxplot',
      data: plotData.boxData,
      itemStyle: {
        borderColor: 'black',
        color: '#DB631C'
      }
    },
    {
      type: 'scatter',
      data: meanPoint,
      symbolSize: 8,
      itemStyle: {
        color: '#14C814',
        borderColor: 'black',
        opacity: 1
      }
    }
  ];

  // build option for echarts
  const option: EChartsOption = {
    yAxis: {
      type: 'category',
      boundaryGap: true,
      splitArea: {show: false},
      splitLine: {show: false},
      axisLine: {
        show: false,
        onZero: false
      },
      axisTick: {show: false},
      axisLabel: {
        formatter: function (d: any, i) {
          return `${plotData.boxData[i].name}`;
        }
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (d: any) {
          return `${d}`;
        }
      },
      splitLine: {show: true, interval: 'auto', lineStyle: {color: '#f3f3f3'}},
      splitArea: {show: false},
      axisTick: {show: true},
      axisLine: {show: true}
    },
    // @ts-ignore
    series,
    // dataZoom: [
    //   {
    //     type: 'inside'
    //   },
    //   {
    //     type: 'slider',
    //     height: 15,
    //     bottom: 25,
    //     fillerColor: 'rgba(255,255,255,0.1)'
    //   }
    // ],
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      confine: true
      // extraCssText: 'z-index: 9999;'
      // formatter: function (params: any) {
      //   // ids that associated with the bar
      //   const range = params[1].data.label;
      //   const count = params[1].value;
      //   return `Range: ${range}<br/> # Observations: ${count}`;
      // }
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
    ],
    // avoid flickering when brushing
    progressive: 0
  };
  return option;
}

type EChartsUpdaterProps = {
  filteredIndex: Uint8ClampedArray | null;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: BoxPlotProps;
  getChartOption: (filteredIndex: Uint8ClampedArray | null, props: BoxPlotProps) => any;
};

const EChartsUpdater = ({
  filteredIndex,
  eChartsRef,
  props,
  getChartOption
}: EChartsUpdaterProps) => {
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
 * The react component of a box plot using eCharts
 */
export const BoxPlot = ({props}: {props: BoxPlotProps}) => {
  const dispatch = useDispatch();

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);

  // use selector to get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

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

  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  // get raw data from props.variable
  const rawDataArray = useMemo(() => {
    const data = props.variables.map(variable => getColumnData(variable, dataContainer));
    return data;
  }, [props.variables, dataContainer]);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getChartOption(filteredIndex, props, rawDataArray);
  }, [filteredIndex, props, rawDataArray]);

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

      // check if brushed.length is 0 after 100ms, since brushSelected may return empty array for some reason?!
      setTimeout(() => {
        if (validPlot && brushed.length === 0) {
          // reset options
          const chart = eChartsRef.current;
          if (chart) {
            const chartInstance = chart.getEchartsInstance();
            const updatedOption = getChartOption(null, props, rawDataArray);
            chartInstance.setOption(updatedOption);
          }
        }
      }, 100);

      // dispatch action to highlight the selected ids
      dispatch({
        type: 'SET_FILTER_INDEXES',
        payload: {dataLabel: tableName, filteredIndex: brushed}
      });
    }
    // brushEnd: function (params: any) {
    //   console.log('brushEnd');
    // }
  };

  // get reference of echarts
  const eChartsRef = useRef<ReactEChartsCore>(null);

  return (
    <Card className="my-4" shadow="none">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-tiny font-bold uppercase">{props.type}</p>
        <small className="text-default-500">{props.variables.join(',')}</small>
      </CardHeader>
      <CardBody className="w-full py-2">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          notMerge={true}
          lazyUpdate={true}
          theme={theme}
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
