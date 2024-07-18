import {useMemo, useRef, useState} from 'react';
import {Card, CardHeader, CardBody} from '@nextui-org/react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {CanvasRenderer} from 'echarts/renderers';
import {useSelector, useDispatch} from 'react-redux';
import {ParallelChart} from 'echarts/charts';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {ParallelCoordinateProps} from '@/actions/plot-actions';
import {getColumnData, getDataContainer} from '@/utils/data-utils';
import {getPCPChartOption} from '@/utils/plots/parallel-coordinate-utils';
import {EChartsUpdater} from './echarts-updater';
import {geodaBrushLink} from '@/actions';
import {mainDataIdSelector, mainTableNameSelector} from '@/store/selectors';

// Register the required components
echarts.use([CanvasRenderer, ParallelChart]);

/**
 * The react component of a parallel-coordinate using eCharts
 */
export const ParallelCoordinatePlot = ({props}: {props: ParallelCoordinateProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);

  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const dataId = useSelector(mainDataIdSelector);

  // use selector to get sourceId of interaction
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);

  // use selector to get tableName
  const tableName = useSelector(mainTableNameSelector);

  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  // get raw data from props.variable
  const rawDataArray = useMemo(() => {
    const data = props.variables.map(variable => getColumnData(variable, dataContainer));
    return data;
  }, [props.variables, dataContainer]);

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
        console.log('axisareaselected', params);
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
          dispatch(geodaBrushLink({sourceId: props.id, dataId, filteredIndex: brushed}));
        }
      }
    }),
    [dataId, dispatch, props.id]
  );

  // dynamically increase height with set max
  const DEFAULT_PCP_HEIGHT = 175;
  const PCP_HEIGHT_PER_VARIABLE = 25;
  const height =
    DEFAULT_PCP_HEIGHT + Math.min(props.variables.length - 2, 3) * PCP_HEIGHT_PER_VARIABLE;

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
            style={{height: height + 'px', width: '100%'}}
            onEvents={bindEvents}
            ref={eChartsRef}
          />
          {rendered && sourceId && sourceId !== props.id && (
            <EChartsUpdater dataId={dataId} eChartsRef={eChartsRef} />
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
      height,
      bindEvents,
      rendered,
      sourceId,
      dataId
    ]
  );
};
