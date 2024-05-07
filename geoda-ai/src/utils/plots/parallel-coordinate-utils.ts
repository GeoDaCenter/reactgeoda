import {ParallelCoordinateProps} from '@/actions';
import {EChartsOption} from 'echarts';
import {numericFormatter} from './format-utils';

export type CreateParallelCoordinateProps = {
  data: {[key: string]: number[]};
};

export function getPCPChartOption(props: ParallelCoordinateProps, rawDataArray?: number[][]) {
  const variableNames = props.variables;
  // get the longest length of variableNames
  const maxLabelLength = Math.max(...variableNames.map(variable => variable.length));
  // assume each character is 12px
  const maxLabelPixel = maxLabelLength * 12;

  const axis = variableNames.map((variable, index) => ({dim: index, name: variable}));
  let dataCols: number[][] = [];
  if (rawDataArray) {
    const transposedData = rawDataArray[0].map((_, colIndex) =>
      rawDataArray.map(row => row[colIndex])
    );
    dataCols = transposedData;
  }

  // build option for echarts
  const option: EChartsOption = {
    parallel: {
      left: '5%',
      right: `${maxLabelPixel}px`,
      top: '23%',
      bottom: '15%',
      layout: 'vertical',
      parallelAxisDefault: {
        axisLabel: {
          formatter: numericFormatter
        }
      }
    },
    brush: {
      toolbox: ['rect', 'keep', 'clear'],
      brushLink: 'all',
      inBrush: {
        color: '#0096C7',
        opacity: 0.8
      },
      outOfBrush: {
        opacity: 0.5
      }
    },
    parallelAxis: axis,
    series: {
      type: 'parallel',
      lineStyle: {
        width: 0.5,
        opacity: 0.8,
        color: 'lightblue'
      },
      data: dataCols,
      // highlight
      emphasis: {
        focus: 'series',
        lineStyle: {
          color: 'red',
          opacity: 0.5
        }
      }
    },
    grid: [
      {
        left: '3%',
        right: '5%',
        top: '20%',
        bottom: '0%',
        containLabel: true,
        height: 'auto'
      }
    ],
    // avoid flickering when brushing
    progressive: 0
  };
  return option;
}
