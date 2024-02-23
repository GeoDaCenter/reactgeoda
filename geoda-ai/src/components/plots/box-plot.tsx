import {RefObject, useEffect, useMemo, useRef} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
import {EChartsOption} from 'echarts';
// Import charts, all with Chart suffix
import {BoxplotChart} from 'echarts/charts';
// import components, all suffixed with Component
import {
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
  BrushComponent,
  TitleComponent
} from 'echarts/components';
// Import renderer, note that introducing the CanvasRenderer or SVGRenderer is a required step
import {
  CanvasRenderer
  // SVGRenderer,
} from 'echarts/renderers';
import {useDispatch, useSelector} from 'react-redux';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';
import {Filter} from '@kepler.gl/types';

import {BoxplotDataProps} from '@/utils/boxplot-utils';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {BoxPlotProps} from '@/actions/plot-actions';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  ToolboxComponent,
  BrushComponent,
  GridComponent,
  BoxplotChart,
  CanvasRenderer
]);

function getChartOption(filteredIndex: Uint8ClampedArray | null, props: BoxPlotProps) {
  // check if there is highlighted from layer by checking if filteredIndex has any 0
  // const hasHighlighted =
  //   filteredIndex && filteredIndex.some((idx: number) => idx === 0) && filteredIndex.length > 1;

  // build highlighted bars from filteredIndex and filteredIndexDict

  // get plotData from props.data
  const plotData: BoxplotDataProps = props.data;

  const series = [
    {
      data: plotData.boxData,
      type: 'boxplot',
      label: {
        show: true,
        position: [0, -15],
        formatter: function (params: {value: any}) {
          return params.value; //display series name
        }
      }
    }
  ];

  // build option for echarts
  const option: EChartsOption = {
    xAxis: {
      type: 'category',
      position: 'bottom',
      boundaryGap: true,
      splitArea: {show: true},
      splitLine: {show: true},
      axisLine: {
        show: false,
        onZero: false
      },
      axisLabel: {
        formatter: function (d: any, i) {
          console.log(d, i);
          return `${plotData.boxData[i].name}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (d: any) {
          return `${d}`;
        }
      },
      splitLine: {show: true},
      splitArea: {show: true},
      axisTick: {show: true},
      axisLine: {show: true}
    },
    // @ts-ignore
    series,
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
    ]
  };
  console.log('getChartOption', option);
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
 * The react component of a box plot using eCharts
 */
export const BoxPlot = ({props}: {props: BoxPlotProps}) => {
  const dispatch = useDispatch();

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);

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

      console.log('brushSelected', brushed);
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
        <small className="text-default-500">{props.variable}</small>
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
