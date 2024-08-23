import {useMemo, useRef, useState} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {useSelector, useDispatch} from 'react-redux';
import {ParallelChart} from 'echarts/charts';
import {GeoDaState} from '@/store';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {getPCPChartOption} from '@/utils/plots/parallel-coordinate-utils';
import {EChartsUpdater} from './echarts-updater';
import {geodaBrushLink} from '@/actions';
import {selectKeplerDataset} from '@/store/selectors';
import {ChartInsightButton} from '../common/chart-insight';
import {ParallelCoordinateStateProps} from '@/reducers/plot-reducer';

// Register the required components
echarts.use([CanvasRenderer, ParallelChart]);

/**
 * The react component of a parallel-coordinate using eCharts
 */
export const ParallelCoordinatePlot = ({props}: {props: ParallelCoordinateStateProps}) => {
  const {id, datasetId, variables} = props;
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  // use selector to get source id
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  // use selector to get keplerDataset
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  // get raw data from props.variable
  const rawDataArray = useMemo(() => {
    const data = variables.map(variable => getColumnDataFromKeplerDataset(variable, keplerDataset));
    return data;
  }, [variables, keplerDataset]);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    return getPCPChartOption(props, rawDataArray);
  }, [props, rawDataArray]);

  const bindEvents = useMemo(
    () => ({
      rendered: function () {
        setRendered(true);
      },
      axisareaselected: function (params: any) {
        if (eChartsRef.current) {
          const chartInstance = eChartsRef.current.getEchartsInstance();
          // @ts-ignore todo: will fix later
          const series = chartInstance.getModel().getSeries()[0];
          const brushed = series.getRawIndicesByActiveState('active');

          // clear any highlighted if no data is brushed
          if (chartInstance && brushed.length === 0) {
            chartInstance.dispatchAction({type: 'downplay'});
          }
          // Dispatch action to highlight selected in other components
          dispatch(geodaBrushLink({sourceId: id, dataId: datasetId, filteredIndex: brushed}));
        }
      }
    }),
    [datasetId, dispatch, id]
  );

  // dynamically increase height with set max
  const DEFAULT_PCP_HEIGHT = 175;
  const PCP_HEIGHT_PER_VARIABLE = 25;
  const height =
    DEFAULT_PCP_HEIGHT + Math.min(props.variables.length - 2, 3) * PCP_HEIGHT_PER_VARIABLE;

  // generate a unique id for the chart
  const chartId = `parallel-coordinate-${props.id}`;

  return useMemo(
    () => (
      <Card className="my-4" shadow="none">
        <CardHeader className="flex-col items-start px-4 pb-0 pt-2" id={chartId}>
          <p className="text-tiny font-bold uppercase">{props.variables.join(',')}</p>
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
            style={{height: height + 'px', width: '100%'}}
            onEvents={bindEvents}
            ref={eChartsRef}
          />
          {rendered && sourceId && sourceId !== props.id && (
            <EChartsUpdater dataId={datasetId} eChartsRef={eChartsRef} />
          )}
        </CardBody>
      </Card>
    ),
    [
      chartId,
      props.variables,
      props.id,
      keplerDataset.label,
      option,
      theme,
      height,
      bindEvents,
      rendered,
      sourceId,
      datasetId
    ]
  );
};
