import React, {useRef, RefObject, useMemo, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getBubbleChartOption} from '@/utils/bubblechart-utils';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {ScatterChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  GridComponent,
  BrushComponent,
  ToolboxComponent
} from 'echarts/components';
import {CanvasRenderer} from 'echarts/renderers';
import {GeoDaState} from '@/store';
import {Filter} from '@kepler.gl/types';
import AutoSizer from 'react-virtualized-auto-sizer';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import {BubbleChartProps} from '@/actions/plot-actions';
import {MAP_ID} from '@/constants';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent
]);

type EChartsUpdaterProps = {
  filteredIndex: Uint8ClampedArray | null;
  eChartsRef: RefObject<ReactEChartsCore>;
  props: BubbleChartProps;
  getChartOption: (filteredIndex: Uint8ClampedArray | null, props: BubbleChartProps) => any;
};

const EChartsUpdater = ({
  filteredIndex,
  eChartsRef,
  props,
  getChartOption
}: EChartsUpdaterProps) => {
  const polygonFilter = useSelector((state: GeoDaState) => {
    const polyFilter = state.keplerGl[MAP_ID].visState.filters.find(
      (f: Filter) => f.type === 'polygon' && f.enabled === true
    );
    return polyFilter?.value?.geometry;
  });

  useEffect(() => {
    if (eChartsRef.current && polygonFilter) {
      const updatedOption = getChartOption(filteredIndex, props);
      const chart = eChartsRef.current.getEchartsInstance();
      if (chart) {
        chart.setOption(updatedOption, true);
      }
    }
  }, [eChartsRef, filteredIndex, getChartOption, polygonFilter, props]);

  return null;
};

export const BubbleChart = ({props}: {props: BubbleChartProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  const filteredIndex = useSelector((state: GeoDaState) => {
    return state.keplerGl[MAP_ID].visState.filteredIndex;
  });

  const validPlot = useSelector((state: GeoDaState) =>
    state.root.plots.find(p => p.id === props.id)
  );

  // get chart option by calling getChartOption only once
  const option = useMemo(() => getBubbleChartOption(filteredIndex, props), [filteredIndex, props]);

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
              const updatedOption = getBubbleChartOption(null, props);
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
                <p className="text-tiny font-bold uppercase">Bubble Chart</p>
                <small className="text-default-500">
                  {props.data.variableX} vs {props.data.variableY} by {props.data.variableSize}
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
                    getChartOption={getBubbleChartOption}
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
