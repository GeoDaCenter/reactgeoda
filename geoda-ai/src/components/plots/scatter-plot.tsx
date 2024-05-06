import React, {useRef, RefObject, useMemo, useEffect} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
//import {ScatterplotDataItemProps, ScatPlotDataProps} from '@/utils/scatterplot-utils';
import {ScatterChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
//import { transform } from 'echarts-stat';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {
  TooltipComponent,
  GridComponent,
  BrushComponent,
  ToolboxComponent
  //DataZoomComponent
} from 'echarts/components';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import {CanvasRenderer} from 'echarts/renderers';
import {ScatterPlotProps} from '@/actions/plot-actions';
import {getScatterChartOption} from '@/utils/scatterplot-utils';
import {geodaBrushLink} from '@/actions';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent
  //DataZoomComponent
]);
//echarts.registerTransform(transform.regression);

type EChartsUpdaterProps = {
  dataId: string;
  eChartsRef: RefObject<ReactEChartsCore>;
  // props: ScatterPlotProps;
  getChartOption: (filteredIndex: number[] | null, props: ScatterPlotProps) => any;
};

// Update the chart when the filteredIndexes change by other components
const EChartsUpdater = ({dataId, eChartsRef, getChartOption}: EChartsUpdaterProps) => {
  // use selector to get filters with type === 'polygon'
  const filteredIndexes = useSelector(
    (state: GeoDaState) => state.root.interaction?.brushLink?.[dataId]
  );

  // store previous filteredIndexes
  const prevFilteredIndexes = useRef<number[] | null>(null);

  useEffect(() => {
    if (filteredIndexes && prevFilteredIndexes.current !== filteredIndexes) {
      prevFilteredIndexes.current = filteredIndexes;
    }
  }, [filteredIndexes]);

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (eChartsRef.current && filteredIndexes) {
      console.log('EChartsUpdater setOption');
      // const updatedOption = getChartOption(filteredIndexes, props);
      const chart = eChartsRef.current;
      if (chart) {
        const chartInstance = chart.getEchartsInstance();
        // chartInstance.dispatchAction({type: 'brush', command: 'clear', areas: []});
        chartInstance.dispatchAction({type: 'downplay'});
        chartInstance.dispatchAction({type: 'highlight', dataIndex: filteredIndexes});
        // chartInstance.setOption(updatedOption, true);
      }
    }
  }, [eChartsRef, filteredIndexes, getChartOption]);

  return null;
};

export const Scatterplot = ({props}: {props: ScatterPlotProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);

  // use selector to get theme and table name
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.dataId) || '';

  // use selector to get sourceId of interaction
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);

  // use selector to check if plot is in state
  const validPlot = useSelector((state: GeoDaState) =>
    state.root.plots.find(p => p.id === props.id)
  );

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getScatterChartOption(null, props);
  }, [props]);

  const bindEvents = useMemo(() => {
    let brushed: number[] = [];
    return {
      brushSelected: function (params: any) {
        brushed = [];
        const brushComponent = params.batch[0];
        for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
          const rawIndices = brushComponent.selected[sIdx].dataIndex;
          brushed.push(...rawIndices);
        }
        // },
        // check if brushed.length is 0 after 100ms, since brushSelected may return empty array for some reason?!
        setTimeout(() => {
          if (validPlot && brushed.length === 0) {
            const chart = eChartsRef.current;
            if (chart) {
              const chartInstance = chart.getEchartsInstance();
              // clear any highlighted if no data is brushed
              chartInstance.dispatchAction({type: 'downplay'});
              // reset options
              // const updatedOption = getScatterChartOption(null, props);
              // chartInstance.setOption(updatedOption);
            }
          }
        }, 100);

        // Dispatch action to highlight selected in other components
        dispatch(geodaBrushLink({sourceId: props.id, dataId: dataId, filteredIndex: brushed}));
      }
    };
  }, [dispatch, props, dataId, validPlot]);

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="h-full w-full" shadow="none">
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">Scatter Plot</p>
                <small className="text-default-500">
                  x: {props.variableX}, y: {props.variableY}
                </small>
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
                />
                {validPlot && sourceId && sourceId !== props.id && (
                  <EChartsUpdater
                    dataId={dataId}
                    eChartsRef={eChartsRef}
                    // props={props}
                    getChartOption={getScatterChartOption}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [props, option, theme, bindEvents, validPlot, sourceId, dataId]
  );
};
