import {useMemo, useRef, useState} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
// Import the echarts core module, which provides the necessary interfaces for using echarts.
import * as echarts from 'echarts/core';
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

import {CreateBoxplotProps, getBoxPlotChartOption} from '@/utils/plots/boxplot-utils';
import {GeoDaState} from '@/store';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {selectKeplerDataset} from '@/store/selectors';
import {ECHARTS_DARK_THEME} from './echarts-theme';
import {ChartInsightButton} from '../common/chart-insight';
import {BoxPlotStateProps} from '@/reducers/plot-reducer';

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
echarts.registerTheme('dark', ECHARTS_DARK_THEME);

/**
 * The react component of a box plot using eCharts
 */
export const BoxPlot = ({props}: {props: BoxPlotStateProps}) => {
  const {id, datasetId, variables, data: boxPlotData} = props;

  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  // use selector to get sourceId of interaction
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  // use selector to get keplerDataset
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const seriesIndex = variables.map((_, i) => i);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    const rawData = variables.reduce((prev: CreateBoxplotProps['data'], cur: string) => {
      const values = getColumnDataFromKeplerDataset(cur, keplerDataset);
      prev[cur] = values;
      return prev;
    }, {});

    return getBoxPlotChartOption({
      rawData,
      boxData: boxPlotData.boxData,
      meanPoint: boxPlotData.meanPoint,
      theme: theme
    });
  }, [variables, boxPlotData.boxData, boxPlotData.meanPoint, theme, keplerDataset]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(params, dispatch, datasetId, id, eChartsRef.current?.getEchartsInstance());
      },
      rendered: function () {
        setRendered(true);
      }
    }),
    [dispatch, datasetId, id]
  );

  // generate a unique id for the chart
  const chartId = `box-plot-${id}`;

  return useMemo(
    () => (
      <Card className="my-4" shadow="none" id={chartId}>
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
          <p className="text-tiny font-bold uppercase">{variables.join(',')}</p>
          <small className="text-default-500">{keplerDataset.label}</small>
          <ChartInsightButton parentElementId={chartId} />
        </CardHeader>
        <CardBody className="w-full py-2">
          <ReactEChartsCore
            echarts={echarts}
            option={option}
            notMerge={true}
            lazyUpdate={true}
            theme={theme}
            onEvents={bindEvents}
            style={{height: '200px', width: '100%'}}
            ref={eChartsRef}
            // onChartReady={() => {
            //   setRendered(true);
            // }}
          />
          {rendered && sourceId && sourceId !== id && (
            <EChartsUpdater dataId={datasetId} eChartsRef={eChartsRef} seriesIndex={seriesIndex} />
          )}
        </CardBody>
      </Card>
    ),
    [
      chartId,
      variables,
      keplerDataset.label,
      option,
      theme,
      bindEvents,
      rendered,
      sourceId,
      id,
      datasetId,
      seriesIndex
    ]
  );
};
