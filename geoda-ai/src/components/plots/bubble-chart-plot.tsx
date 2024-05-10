import React, {useRef, useMemo, useState} from 'react';
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
import AutoSizer from 'react-virtualized-auto-sizer';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import {BubbleChartProps} from '@/actions/plot-actions';
import {MAP_ID} from '@/constants';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent
]);

export const BubbleChart = ({props}: {props: BubbleChartProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  // flag to check if the chart is rendered
  const [rendered, setRendered] = useState(false);

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.dataId) || '';
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);
  // get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  const {id, variableX, variableY, variableSize, variableColor} = props;

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    // get xData from variableX
    const xData = getColumnData(variableX, dataContainer);
    // get yData from variableY
    const yData = getColumnData(variableY, dataContainer);
    // get sizeData from variableSize
    const sizeData = getColumnData(variableSize, dataContainer);
    // get colorData from variableColor
    const colorData = variableColor ? getColumnData(variableColor, dataContainer) : undefined;

    return getBubbleChartOption({variableX, variableY, xData, yData, sizeData, colorData});
  }, [dataContainer, variableColor, variableSize, variableX, variableY]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(params, dispatch, dataId, id, eChartsRef.current?.getEchartsInstance());
      }
    }),
    [dispatch, dataId, id]
  );

  const title = `${variableX} vs ${variableY} by ${variableSize}`;

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="h-full w-full" shadow="none">
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">Bubble Chart</p>
                <small className="text-default-500">{title}</small>
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
                  onChartReady={() => {
                    setRendered(true);
                  }}
                />
                {rendered && sourceId && sourceId !== id && (
                  <EChartsUpdater dataId={dataId} eChartsRef={eChartsRef} />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [title, option, theme, bindEvents, rendered, sourceId, id, dataId]
  );
};
