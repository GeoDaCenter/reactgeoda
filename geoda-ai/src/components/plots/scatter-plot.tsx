import React, {useRef, useMemo, useState, useCallback} from 'react';
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
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@nextui-org/react';
import {CanvasRenderer} from 'echarts/renderers';
import {getScatterChartOption} from '@/utils/plots/scatterplot-utils';
import {EChartsUpdater} from './echarts-updater';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {selectKeplerDataset} from '@/store/selectors';
import {ChartInsightButton} from '../common/chart-insight';
import {ScatterPlotStateProps} from '@/reducers/plot-reducer';
import {Icon} from '@iconify/react/dist/iconify.js';
import {linearRegression, RegressionResults} from '../../utils/math/linear-regression';
import {updatePlot} from '@/actions/plot-actions';
import {ChowTestResult, chowTest} from '@/utils/math-utils';
import {SimpleScatterPlot} from './simple-scatter-plot';

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

export const Scatterplot = ({props}: {props: ScatterPlotStateProps}) => {
  const dispatch = useDispatch();
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [xSelected, setXSelected] = useState<number[]>([]);
  const [ySelected, setYSelected] = useState<number[]>([]);
  const [xUnselected, setXUnselected] = useState<number[]>([]);
  const [yUnselected, setYUnselected] = useState<number[]>([]);
  const [regressionResults, setRegressionResults] = useState<{
    all: RegressionResults;
    selected: RegressionResults | null;
    unselected: RegressionResults | null;
  } | null>(null);
  const [chowTestResults, setChowTestResults] = useState<ChowTestResult | null>(null);

  const {id, datasetId, variableX, variableY} = props;

  // use selector to get theme and table name
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  // use selector to get sourceId of interaction
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);
  // use selector to get keplerDataset
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const {xData, yData} = useMemo(() => {
    const xData = getColumnDataFromKeplerDataset(variableX, keplerDataset);
    const yData = getColumnDataFromKeplerDataset(variableY, keplerDataset);
    return {xData, yData};
  }, [keplerDataset, variableX, variableY]);

  // get chart option by calling getChartOption only once
  const option = useMemo(() => {
    const showRegressionLine = true;
    const showLoess = true;
    return getScatterChartOption(
      variableX,
      xData,
      variableY,
      yData,
      showRegressionLine,
      showLoess,
      regressionResults?.all,
      regressionResults?.selected,
      regressionResults?.unselected
    );
  }, [variableX, variableY, xData, yData, regressionResults]);

  const onSelected = useCallback(
    ({filteredIndex}: {filteredIndex: number[]}) => {
      const selected = new Set(filteredIndex);
      const selectedX: number[] = [];
      const selectedY: number[] = [];
      const unselectedX: number[] = [];
      const unselectedY: number[] = [];

      xData.forEach((x, i) => {
        if (selected.has(i)) {
          selectedX.push(x);
          selectedY.push(yData[i]);
        } else {
          unselectedX.push(x);
          unselectedY.push(yData[i]);
        }
      });

      setXSelected(selectedX);
      setYSelected(selectedY);
      setXUnselected(unselectedX);
      setYUnselected(unselectedY);

      // update regression results
      const allResults = linearRegression(xData, yData);
      const selectedResults = selectedX.length > 0 ? linearRegression(selectedX, selectedY) : null;
      const unselectedResults =
        unselectedX.length > 0 ? linearRegression(unselectedX, unselectedY) : null;
      setRegressionResults({
        all: allResults,
        selected: selectedResults,
        unselected: unselectedResults
      });

      // Calculate Chow test results if both selected and unselected data exist
      if (showMore && selectedX.length > 0 && unselectedX.length > 0) {
        const chowResults = chowTest(selectedX, selectedY, unselectedX, unselectedY);
        setChowTestResults(chowResults);
      } else {
        setChowTestResults(null);
      }

      // highlight selected points
      eChartsRef.current?.getEchartsInstance()?.dispatchAction({
        type: 'highlight',
        dataIndex: filteredIndex,
        data: 'scatter-selected'
      });
    },
    [xData, yData, showMore]
  );

  const bindEvents = useMemo(
    () => ({
      highlight: function (params: any) {
        if (!params.data) {
          // trigger onSelected
          onSelected({filteredIndex: params.dataIndex});
        }
      }
    }),
    [onSelected]
  );

  const title = `X: ${variableX} vs Y: ${variableY}`;

  // generate a unique id for the chart
  const chartId = `scatterplot-${id}`;

  const handleMorePress = useCallback(() => {
    if (!showMore) {
      const allResults = linearRegression(xData, yData);
      const selectedResults = xSelected.length > 0 ? linearRegression(xSelected, ySelected) : null;
      const unselectedResults =
        xUnselected.length > 0 ? linearRegression(xUnselected, yUnselected) : null;

      setRegressionResults({
        all: allResults,
        selected: selectedResults,
        unselected: unselectedResults
      });
    }
    setShowMore(!showMore);
    dispatch(updatePlot({...props, showMore: !showMore}));
  }, [showMore, xData, yData, xSelected, ySelected, xUnselected, yUnselected, dispatch, props]);

  return useMemo(
    () => (
      <AutoSizer>
        {({height, width}) => (
          <div style={{height, width}}>
            <Card className="mb-8 h-full w-full" shadow="none" id={chartId}>
              <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                <p className="text-tiny font-bold uppercase">{title}</p>
                <small className="text-default-500">{keplerDataset.label}</small>
                <ChartInsightButton parentElementId={chartId} />
              </CardHeader>
              <CardBody className="relative py-2">
                <div className="absolute left-0 top-0 h-full w-full">
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
                </div>
                <div className="absolute left-0 top-0 h-full w-full">
                  <SimpleScatterPlot
                    props={{
                      id,
                      datasetId,
                      variableX,
                      variableY,
                      type: 'simplescatter'
                    }}
                  />
                </div>
              </CardBody>
              <CardFooter className="flex flex-col gap-2 px-4 py-2">
                <div className="flex w-full justify-end">
                  <Button
                    size="sm"
                    variant="light"
                    startContent={
                      <Icon icon="material-symbols-light:query-stats" width="18" height="18" />
                    }
                    endContent={
                      showMore && (
                        <Icon icon="solar:alt-arrow-up-line-duotone" width="18" height="18" />
                      )
                    }
                    onPress={handleMorePress}
                  >
                    More
                  </Button>
                </div>

                {showMore && regressionResults && (
                  <div className="w-full text-tiny">
                    <div className="mb-2">
                      <small className="text-tiny text-default-500">
                        R² (All) = {regressionResults.all.rSquared.toFixed(4)}
                        {regressionResults.selected &&
                          ` | R² (Selected) = ${regressionResults.selected.rSquared.toFixed(4)}`}
                        {regressionResults.unselected &&
                          ` | R² (Unselected) = ${regressionResults.unselected.rSquared.toFixed(4)}`}
                      </small>
                    </div>
                    <Table
                      aria-label="Regression Results"
                      classNames={{
                        base: 'overflow-scroll p-0 m-0 text-tiny',
                        table: 'p-0 m-0 text-tiny',
                        wrapper: 'p-0 pr-2',
                        th: 'text-tiny',
                        td: 'text-[9px]'
                      }}
                      isCompact={true}
                      removeWrapper={true}
                    >
                      <TableHeader>
                        <TableColumn>Type</TableColumn>
                        <TableColumn>Parameter</TableColumn>
                        <TableColumn>Estimate</TableColumn>
                        <TableColumn>Std. Error</TableColumn>
                        <TableColumn>t-Statistic</TableColumn>
                        <TableColumn>p-Value</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {[
                          // All Data Results
                          <TableRow key="all-intercept">
                            <TableCell>All</TableCell>
                            <TableCell>Intercept</TableCell>
                            <TableCell>
                              {regressionResults.all.intercept.estimate.toFixed(4)}
                            </TableCell>
                            <TableCell>
                              {regressionResults.all.intercept.standardError.toFixed(4)}
                            </TableCell>
                            <TableCell>
                              {regressionResults.all.intercept.tStatistic.toFixed(4)}
                            </TableCell>
                            <TableCell>
                              {regressionResults.all.intercept.pValue.toFixed(4)}
                            </TableCell>
                          </TableRow>,
                          <TableRow key="all-slope">
                            <TableCell>All</TableCell>
                            <TableCell>Slope</TableCell>
                            <TableCell>{regressionResults.all.slope.estimate.toFixed(4)}</TableCell>
                            <TableCell>
                              {regressionResults.all.slope.standardError.toFixed(4)}
                            </TableCell>
                            <TableCell>
                              {regressionResults.all.slope.tStatistic.toFixed(4)}
                            </TableCell>
                            <TableCell>{regressionResults.all.slope.pValue.toFixed(4)}</TableCell>
                          </TableRow>,
                          // Selected Data Results
                          ...(regressionResults.selected
                            ? [
                                <TableRow key="selected-intercept">
                                  <TableCell>Selected</TableCell>
                                  <TableCell>Intercept</TableCell>
                                  <TableCell>
                                    {regressionResults.selected.intercept.estimate.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.selected.intercept.standardError.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.selected.intercept.tStatistic.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.selected.intercept.pValue.toFixed(4)}
                                  </TableCell>
                                </TableRow>,
                                <TableRow key="selected-slope">
                                  <TableCell>Selected</TableCell>
                                  <TableCell>Slope</TableCell>
                                  <TableCell>
                                    {regressionResults.selected.slope.estimate.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.selected.slope.standardError.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.selected.slope.tStatistic.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.selected.slope.pValue.toFixed(4)}
                                  </TableCell>
                                </TableRow>
                              ]
                            : []),
                          // Unselected Data Results
                          ...(regressionResults.unselected
                            ? [
                                <TableRow key="unselected-intercept">
                                  <TableCell>Unselected</TableCell>
                                  <TableCell>Intercept</TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.intercept.estimate.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.intercept.standardError.toFixed(
                                      4
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.intercept.tStatistic.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.intercept.pValue.toFixed(4)}
                                  </TableCell>
                                </TableRow>,
                                <TableRow key="unselected-slope">
                                  <TableCell>Unselected</TableCell>
                                  <TableCell>Slope</TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.slope.estimate.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.slope.standardError.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.slope.tStatistic.toFixed(4)}
                                  </TableCell>
                                  <TableCell>
                                    {regressionResults.unselected.slope.pValue.toFixed(4)}
                                  </TableCell>
                                </TableRow>
                              ]
                            : [])
                        ]}
                      </TableBody>
                    </Table>

                    {chowTestResults && (
                      <div className="mt-2">
                        <small className="text-tiny text-default-500">
                          Chow test for sel/unsel regression subsets: distrib=F(2,{' '}
                          {xData.length - 4}), ratio={chowTestResults.fStat.toFixed(4)}, p-val=
                          {chowTestResults.pValue.toFixed(4)}
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </CardFooter>
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
      datasetId,
      variableX,
      variableY,
      showMore,
      handleMorePress,
      regressionResults,
      chowTestResults,
      xData.length
    ]
  );
};
