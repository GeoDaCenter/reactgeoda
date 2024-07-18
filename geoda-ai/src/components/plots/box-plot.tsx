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
import {BoxPlotProps} from '@/actions/plot-actions';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';
import {getColumnData} from '@/utils/data-utils';
import {keplerDataContainerSelector, mainDataIdSelector} from '@/store/selectors';
import {ECHARTS_DARK_THEME} from './echarts-theme';

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
export const BoxPlot = ({props}: {props: BoxPlotProps}) => {
  const {id, type, variables, data: boxPlotData} = props;

  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector(mainDataIdSelector);
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  // use selector to get dataContainer
  const dataContainer = useSelector(keplerDataContainerSelector);

  const seriesIndex = variables.map((_, i) => i);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    const rawData = variables.reduce((prev: CreateBoxplotProps['data'], cur: string) => {
      const values = getColumnData(cur, dataContainer);
      prev[cur] = values;
      return prev;
    }, {});

    return getBoxPlotChartOption({
      rawData,
      boxData: boxPlotData.boxData,
      meanPoint: boxPlotData.meanPoint,
      theme: theme
    });
  }, [boxPlotData.boxData, boxPlotData.meanPoint, dataContainer, variables, theme]);

  const bindEvents = useMemo(
    () => ({
      brushSelected: function (params: any) {
        onBrushSelected(params, dispatch, dataId, id, eChartsRef.current?.getEchartsInstance());
      },
      rendered: function () {
        setRendered(true);
      }
    }),
    [dispatch, dataId, id]
  );

  return useMemo(
    () => (
      <Card className="my-4" shadow="none">
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
          <p className="text-tiny font-bold uppercase">{type}</p>
          <small className="text-default-500">{variables.join(',')}</small>
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
            <EChartsUpdater dataId={dataId} eChartsRef={eChartsRef} seriesIndex={seriesIndex} />
          )}
        </CardBody>
      </Card>
    ),
    [type, variables, option, theme, bindEvents, rendered, sourceId, id, dataId, seriesIndex]
  );
};
