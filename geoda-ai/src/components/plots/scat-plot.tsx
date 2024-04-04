import React, {useRef, RefObject, useMemo, useEffect} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
//import {ScatterplotDataItemProps, ScatPlotDataProps} from '@/utils/scatterplot-utils';
import {ScatterChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
//import { transform } from 'echarts-stat';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {Filter} from '@kepler.gl/types';
import {
  TooltipComponent,
  GridComponent,
  BrushComponent,
  ToolboxComponent
  //DataZoomComponent
} from 'echarts/components';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {MAP_ID} from '@/constants';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import {CanvasRenderer} from 'echarts/renderers';
import {ScatterPlotProps} from '@/actions/plot-actions';
import {getScatterChartOption} from '@/utils/scatterplot-utils';

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
  filteredIndex: Uint8ClampedArray | null;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: ScatterPlotProps;
  getChartOption: (filteredIndex: Uint8ClampedArray | null, props: ScatterPlotProps) => any;
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

export const Scatterplot = ({props}: {props: ScatterPlotProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);

  // use selector to get theme and table name
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
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

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getScatterChartOption(filteredIndex, props);
  }, [filteredIndex, props]);

  const bindEvents = useMemo(() => {
    return {
      brushSelected: function (params: any) {
        const brushed = [];
        const brushComponent = params.batch[0];
        for (let sIdx = 0; sIdx < brushComponent.selected.length; sIdx++) {
          const rawIndices = brushComponent.selected[sIdx].dataIndex;
          brushed.push(...rawIndices);
        }

        // check if brushed.length is 0 after 100ms, since brushSelected may return empty array for some reason?!
        setTimeout(() => {
          if (validPlot && brushed.length === 0) {
            // reset options
            const chart = eChartsRef.current;
            if (chart) {
              const chartInstance = chart.getEchartsInstance();
              const updatedOption = getScatterChartOption(null, props);
              chartInstance.setOption(updatedOption);
            }
          }
        }, 100);

        // Dispatch action to highlight selected indices
        dispatch({
          type: 'SET_FILTER_INDEXES',
          payload: {dataLabel: tableName, filteredIndex: brushed}
        });
      }
    };
  }, [dispatch, validPlot, props, tableName]);

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
                {validPlot && (
                  <EChartsUpdater
                    filteredIndex={filteredIndex}
                    eChartsRef={eChartsRef}
                    props={props}
                    getChartOption={getScatterChartOption}
                  />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [filteredIndex, option, theme, validPlot, props, bindEvents]
  );
};
