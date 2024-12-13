import React, {useRef, useMemo, useState, useEffect, useCallback} from 'react';
import {ScatterChart} from 'echarts/charts';
import * as echarts from 'echarts/core';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {
  TooltipComponent,
  GridComponent,
  BrushComponent,
  ToolboxComponent
} from 'echarts/components';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import {CanvasRenderer} from 'echarts/renderers';
import {getColumnDataFromKeplerDataset} from '@/utils/data-utils';
import {selectKeplerDataset} from '@/store/selectors';
import {ScatterPlotStateProps} from '@/reducers/plot-reducer';
import {getScatterChartOption} from '@/utils/plots/scatterplot-utils';
import {linearRegression, RegressionResults} from '../../utils/math/linear-regression';
import {ChowTestResult, chowTest} from '@/utils/math-utils';

// Register the required ECharts components
echarts.use([
  TooltipComponent,
  GridComponent,
  ScatterChart,
  CanvasRenderer,
  BrushComponent,
  ToolboxComponent
]);

type ScatterRegressionPlotProps = ScatterPlotStateProps & {
  regressionResults: {
    all: RegressionResults;
    selected: RegressionResults | null;
    unselected: RegressionResults | null;
  } | null;
  setRegressionResults: (results: {
    all: RegressionResults;
    selected: RegressionResults | null;
    unselected: RegressionResults | null;
  }) => void;
  setChowTestResults: (results: ChowTestResult | null) => void;
};

export const ScatterRegressionPlot = ({props}: {props: ScatterRegressionPlotProps}) => {
  const eChartsRef = useRef<ReactEChartsCore>(null);
  const [rendered, setRendered] = useState(false);
  const {id, datasetId, variableX, variableY} = props;

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);
  const keplerDataset = useSelector(selectKeplerDataset(datasetId));
  // use selector to get source id
  const sourceId = useSelector((state: GeoDaState) => state.root.interaction?.sourceId);

  const {xData, yData} = useMemo(() => {
    const xData = getColumnDataFromKeplerDataset(variableX, keplerDataset);
    const yData = getColumnDataFromKeplerDataset(variableY, keplerDataset);
    return {xData, yData};
  }, [keplerDataset, variableX, variableY]);

  const filteredIndexes = useSelector(
    (state: GeoDaState) => state.root.interaction?.brushLink?.[datasetId]
  );
  // get dataset from store
  const dataset = useSelector(selectKeplerDataset(datasetId));
  const numberOfRows = dataset?.length || 0;

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
      props.regressionResults?.all,
      props.regressionResults?.selected,
      props.regressionResults?.unselected
    );
  }, [variableX, variableY, xData, yData, props.regressionResults]);

  const computeRegressionResults = useCallback(
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

      // update regression results
      const allResults = linearRegression(xData, yData);
      const selectedResults = selectedX.length > 0 ? linearRegression(selectedX, selectedY) : null;
      const unselectedResults =
        unselectedX.length > 0 ? linearRegression(unselectedX, unselectedY) : null;
      props.setRegressionResults({
        all: allResults,
        selected: selectedResults,
        unselected: unselectedResults
      });

      // Calculate Chow test results if both selected and unselected data exist
      if (selectedX.length > 0 && unselectedX.length > 0) {
        const chowResults = chowTest(selectedX, selectedY, unselectedX, unselectedY);
        props.setChowTestResults(chowResults);
      } else {
        props.setChowTestResults(null);
      }
    },
    [xData, props, yData]
  );

  // when filteredIndexTrigger changes, update the chart option using setOption
  useEffect(() => {
    if (rendered && sourceId && sourceId !== id && eChartsRef.current && filteredIndexes) {
      computeRegressionResults({filteredIndex: filteredIndexes});
      const showRegressionLine = true;
      const showLoess = true;
      const updatedOption = getScatterChartOption(
        variableX,
        xData,
        variableY,
        yData,
        showRegressionLine,
        showLoess,
        props.regressionResults?.all,
        props.regressionResults?.selected,
        props.regressionResults?.unselected
      );
      const chart = eChartsRef.current;
      if (chart && filteredIndexes.length < numberOfRows) {
        const chartInstance = chart.getEchartsInstance();
        chartInstance.setOption(updatedOption, true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredIndexes, rendered]);

  const bindEvents = useMemo(() => ({}), []);

  return (
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
  );
};
