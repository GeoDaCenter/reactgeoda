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

import {getBoxPlotChartOption} from '@/utils/plots/boxplot-utils';
import {GeoDaState} from '@/store';
import {BoxPlotProps} from '@/actions/plot-actions';
import {EChartsUpdater, onBrushSelected} from './echarts-updater';

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

/**
 * The react component of a box plot using eCharts
 */
export const BoxPlot = ({props}: {props: BoxPlotProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.dataId) || '';
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);

  const seriesIndex = props.variables.map((_, i) => i);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getBoxPlotChartOption(props);
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
            onEvents={bindEvents}
            style={{height: '200px', width: '100%'}}
            ref={eChartsRef}
            // onChartReady={() => {
            //   setRendered(true);
            // }}
          />
          {rendered && sourceId && sourceId !== props.id && (
            <EChartsUpdater dataId={dataId} eChartsRef={eChartsRef} seriesIndex={seriesIndex} />
          )}
        </CardBody>
      </Card>
    ),
    [
      props.type,
      props.variables,
      props.id,
      option,
      theme,
      bindEvents,
      rendered,
      sourceId,
      dataId,
      seriesIndex
    ]
  );
};
