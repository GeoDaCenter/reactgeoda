import React, {useState, useCallback} from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import {useDispatch, useSelector} from 'react-redux';
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
import {selectKeplerDataset} from '@/store/selectors';
import {ChartInsightButton} from '../common/chart-insight';
import {ScatterPlotStateProps} from '@/reducers/plot-reducer';
import {Icon} from '@iconify/react/dist/iconify.js';
import {RegressionResults} from '../../utils/math/linear-regression';
import {updatePlot} from '@/actions/plot-actions';
import {ChowTestResult} from '@/utils/math-utils';
import {SimpleScatterPlot} from './simple-scatter-plot';
import {ScatterRegressionPlot} from './scatter-regression-plot';

export const Scatterplot = ({props}: {props: ScatterPlotStateProps}) => {
  const dispatch = useDispatch();
  const [showMore, setShowMore] = useState(false);
  const [regressionResults, setRegressionResults] = useState<{
    all: RegressionResults;
    selected: RegressionResults | null;
    unselected: RegressionResults | null;
  } | null>(null);
  const [chowTestResults, setChowTestResults] = useState<ChowTestResult | null>(null);

  const {id, datasetId, variableX, variableY} = props;

  // use selector to get keplerDataset
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));

  const numberOfRows = keplerDataset?.length || 0;

  const title = `X: ${variableX} vs Y: ${variableY}`;

  // generate a unique id for the chart
  const chartId = `scatterplot-${id}`;

  const handleMorePress = useCallback(() => {
    setShowMore(!showMore);
    dispatch(updatePlot({...props, showMore: !showMore}));
  }, [showMore, dispatch, props]);

  return (
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
                <ScatterRegressionPlot
                  props={{
                    id,
                    datasetId,
                    variableX,
                    variableY,
                    type: 'scatter',
                    regressionResults,
                    setRegressionResults,
                    setChowTestResults
                  }}
                />
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
                          <TableCell>{regressionResults.all.intercept.pValue.toFixed(4)}</TableCell>
                        </TableRow>,
                        <TableRow key="all-slope">
                          <TableCell>All</TableCell>
                          <TableCell>Slope</TableCell>
                          <TableCell>{regressionResults.all.slope.estimate.toFixed(4)}</TableCell>
                          <TableCell>
                            {regressionResults.all.slope.standardError.toFixed(4)}
                          </TableCell>
                          <TableCell>{regressionResults.all.slope.tStatistic.toFixed(4)}</TableCell>
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
                                  {regressionResults.unselected.intercept.standardError.toFixed(4)}
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
                        Chow test for sel/unsel regression subsets: distrib=F(2, {numberOfRows - 4}
                        ), ratio={chowTestResults.fStat.toFixed(4)}, p-val=
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
  );
};
