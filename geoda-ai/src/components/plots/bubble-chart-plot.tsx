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
import {BubbleChartStateProps} from '@/reducers/plot-reducer';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';
import {selectKeplerDataset} from '@/store/selectors';
import {ChartInsightButton} from '../common/chart-insight';
import {ECHARTS_DARK_THEME} from './echarts-theme';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent
]);
echarts.registerTheme('dark', ECHARTS_DARK_THEME);

export const BubbleChart = ({props}: {props: BubbleChartStateProps}) => {
  const {id, datasetId, variableX, variableY, variableSize, variableColor} = props;

  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  // flag to check if the chart is rendered
  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  // use selector to get source id
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  // use selector to get keplerDataset
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    const xData = getColumnDataFromKeplerDataset(variableX, keplerDataset);
    const yData = getColumnDataFromKeplerDataset(variableY, keplerDataset);
    const sizeData = getColumnDataFromKeplerDataset(variableSize, keplerDataset);
    const colorData = variableColor
      ? getColumnDataFromKeplerDataset(variableColor, keplerDataset)
      : undefined;

    return getBubbleChartOption({
      variableX,
      variableY,
      xData,
      yData,
      sizeData,
      colorData
    });
  }, [keplerDataset, variableColor, variableSize, variableX, variableY]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(params, dispatch, datasetId, id, eChartsRef.current?.getEchartsInstance());
      }
    }),
    [dispatch, datasetId, id]
  );

  const title = `${variableX} vs ${variableY} by ${variableSize}`;

  // generate a unique id for the chart
  const chartId = `bubble-chart-${id}`;

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="h-full w-full" shadow="none" id={chartId}>
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">{title}</p>
                <small className="text-default-500">{keplerDataset.label}</small>
                <ChartInsightButton parentElementId={chartId} />
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
                  <EChartsUpdater dataId={datasetId} eChartsRef={eChartsRef} />
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </AutoSizer>
    ),
    [
      chartId,
      title,
      keplerDataset.label,
      option,
      theme,
      bindEvents,
      rendered,
      sourceId,
      id,
      datasetId
    ]
  );
};
