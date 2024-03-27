import {RefObject, useEffect, useMemo, useRef} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {EChartsOption} from 'echarts';
import {CanvasRenderer} from 'echarts/renderers';
import {useSelector, useDispatch} from 'react-redux';
import {Filter} from '@kepler.gl/types';
import {ParallelChart} from 'echarts/charts';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {ParallelCoordinateProps} from '@/actions/plot-actions';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';

// Register the required components
echarts.use([CanvasRenderer, ParallelChart]);

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
      top: '23%',
      bottom: '15%',
      layout: 'vertical',
      parallelAxisDefault: {
        axisLabel: {
          formatter: (value: number): string => {
            return Intl.NumberFormat('en-US', {
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(value);
          }
        }
      }
    },
    parallelAxis: axis,
    series: {
      type: 'parallel',
      lineStyle: {
        width: 0.5,
        opacity: 0.5
      },
      data: dataCols
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

  // get reference of echarts
  const eChartsRef = useRef<ReactEChartsCore>(null);

  useEffect(() => {
    // Ensure that the chart instance is available
    if (eChartsRef.current) {
      const chartInstance = eChartsRef.current.getEchartsInstance();

      // Define the event handler function
      const onAxisAreaSelected = () => {
        // @ts-ignore todo: will fix later
        const series = chartInstance.getModel().getSeries()[0];
        const brushed = series.getRawIndicesByActiveState('active');

        // When user clears selection on map also clear selection on chart
        if (validPlot && brushed.length === 0) {
          // reset options
          const chart = eChartsRef.current;
          if (chart) {
            const chartInstance = chart.getEchartsInstance();
            const updatedOption = getChartOption(null, props, rawDataArray);
            chartInstance.setOption(updatedOption);
          }
        }
        // dispatch action to highlight the selected ids
        dispatch({
          type: 'SET_FILTER_INDEXES',
          payload: {dataLabel: tableName, filteredIndex: brushed}
        });
      };

      // Attach the event listener
      chartInstance.on('axisareaselected', onAxisAreaSelected);
      return () => {
        chartInstance.off('axisareaselected', onAxisAreaSelected);
      };
    } else {
      return undefined;
    }
  }, [dispatch, props, rawDataArray, tableName, validPlot]);

  // dynamically increase height with set max
  const DEFAULT_PCP_HEIGHT = 175;
  const PCP_HEIGHT_PER_VARIABLE = 25;
  const height =
    DEFAULT_PCP_HEIGHT + Math.min(props.variables.length - 2, 3) * PCP_HEIGHT_PER_VARIABLE;

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
