import {RefObject, useEffect, useMemo, useRef} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {EChartsOption} from 'echarts';
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
import {useSelector} from 'react-redux';
import {Filter} from '@kepler.gl/types';
import {ParallelChart} from 'echarts/charts';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {ParallelCoordinateProps} from '@/actions/plot-actions';
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
  CanvasRenderer,
  ParallelChart
]);

function getChartOption(
  filteredIndex: Uint8ClampedArray | null,
  props: ParallelCoordinateProps,
  rawDataArray?: number[][]
) {
  const axis = props.variables.map((variable, index) => ({dim: index, name: variable}));
  let dataCols: number[][] = [];
  if (rawDataArray) {
    const transposedData = rawDataArray[0].map((_, colIndex) =>
      rawDataArray.map(row => row[colIndex])
    );
    dataCols = transposedData;
  }

  // build option for echarts
  const option: EChartsOption = {
    parallel: {
      left: '5%',
      right: '35%',
      top: '6%',
      bottom: '15%',
      layout: 'vertical',
      parallelAxisDefault: {
        axisLabel: {
          formatter: (value: number): string => {
            // The logic remains the same, but with explicit typing
            if (value >= 1000 && value < 1000000) {
              return `${value / 1000}K`; // Convert to "K" for thousands
            } else if (value >= 1000000) {
              return `${value / 1000000}M`; // Convert to "M" for millions
            }
            return value.toString(); // Convert the number to string if less than 1000
          }
        }
      }
    },
    parallelAxis: axis,
    series: {
      type: 'parallel',
      lineStyle: {
        width: 0.5,
        opacity: 0.05
      },
      data: dataCols
    }
  };
  console.log('getChartOption', option);
  return option;
}

type EChartsUpdaterProps = {
  filteredIndex: Uint8ClampedArray | null;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: ParallelCoordinateProps;
  getChartOption: (filteredIndex: Uint8ClampedArray | null, props: ParallelCoordinateProps) => any;
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
 * The react component of a parallel-coordinate using eCharts
 */
export const ParallelCoordinatePlot = ({props}: {props: ParallelCoordinateProps}) => {
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

  // get reference of echarts
  const eChartsRef = useRef<ReactEChartsCore>(null);

  // dynamically increase height with set max
  const height = 175 + Math.min(props.variables.length - 2, 3) * 25;

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
          style={{height: height + 'px', width: '100%'}}
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
