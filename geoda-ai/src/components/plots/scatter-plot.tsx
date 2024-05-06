import React, {useRef, useMemo, useState} from 'react';
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
import {EChartsUpdater, onBrushSelected} from './echarts-updater';

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

export const Scatterplot = ({props}: {props: ScatterPlotProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  // use selector to get theme and table name
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.dataId) || '';

  // use selector to get sourceId of interaction
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getScatterChartOption(null, props);
  }, [props]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(
          params,
          dispatch,
          dataId,
          props.id,
          eChartsRef.current?.getEchartsInstance()
        );
      },
      rendered: function () {
        setRendered(true);
      }
    }),
    [dispatch, dataId, props.id]
  );

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
                {rendered && sourceId && sourceId !== props.id && (
                  <EChartsUpdater dataId={dataId} eChartsRef={eChartsRef} />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [props, option, theme, bindEvents, rendered, sourceId, dataId]
  );
};
