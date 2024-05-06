import {BoxPlotProps} from '@/actions';
import {quantile as d3Quantile, median as d3Median, mean as d3Mean} from 'd3-array';
import {EChartsOption} from 'echarts';

// Boxplot data input props
export type CreateBoxplotProps = {
  data: {[key: string]: number[]};
  boundIQR: number;
};

// Boxplot data output props, which is compatible with eCharts boxplot series data
export type BoxplotDataProps = {
  // the boxData which will be rendred as boxplot by eCharts
  // [low, Q1, Q2, Q3, high]
  boxData: Array<{name: string; value: [number, number, number, number, number]}>;
  // the outliers, which will be rendred as red points, not used for now
  outlier?: [string, number][];
  // the mean point, which will be rendred as a green point
  meanPoint: [string, number][];
  // the visible points, which will be rendred as blue points that are not covered by the box
  visiblePoints: [string, number][];
  // raw data
  rawData: {[key: string]: number[]};
};

/**
 * Create a boxplot from a list of numbers and option boundIQR (1.5 or 3.0)
 */
export function createBoxplot({data, boundIQR}: CreateBoxplotProps): BoxplotDataProps {
  const meanPoint: [string, number][] = [];
  const visiblePoints: [string, number][] = [];

  // iterate through the data and calculate the boxplot data
  const boxData: BoxplotDataProps['boxData'] = Object.keys(data).map((key: string) => {
    const values = data[key];
    const sortedData = values.sort((a, b) => a - b);
    const q1 = d3Quantile(sortedData, 0.25) || 0;
    const q3 = d3Quantile(sortedData, 0.75) || 0;
    const iqr = q3 - q1;
    const min = q1 - boundIQR * iqr;
    const max = q3 + boundIQR * iqr;
    const median = d3Median(sortedData) || 0;
    const mean = d3Mean(sortedData) || 0;
    // const outliers = sortedData.filter(d => d < min || d > max);
    const visible = sortedData.filter(d => d >= q3 && d <= q1);
    visible.map((d: number) => visiblePoints.push([key, d]));
    meanPoint.push([key, mean]);

    return {name: key, value: [min, q1, median, q3, max]};
  });

  return {boxData, meanPoint, visiblePoints, rawData: data};
}

export function getBoxPlotChartOption(props: BoxPlotProps) {
  // get plotData from props.data
  const plotData: BoxplotDataProps = props.data;

  // build scatter plot data using rawData in the form of [0, value]
  const pointsData = Object.values(plotData.rawData)?.map(
    (rawData, dataIndex) => rawData?.map((value: number) => [value, dataIndex]) || []
  );

  // build mean point
  const meanPoint = plotData.meanPoint.map((mp, dataIndex) => [mp[1], dataIndex]);

  const scatterSeries =
    pointsData?.map(data => ({
      type: 'scatter',
      data,
      symbolSize: 6,
      itemStyle: {
        color: 'lightblue'
      },
      // highlight
      emphasis: {
        focus: 'series',
        symbolSize: 6,
        itemStyle: {
          color: 'red',
          borderWidth: 1
        }
      }
    })) || [];

  const series = [
    ...scatterSeries,
    {
      type: 'boxplot',
      data: plotData.boxData,
      itemStyle: {
        borderColor: 'black',
        color: '#DB631C'
      }
    },
    {
      type: 'scatter',
      data: meanPoint,
      symbolSize: 8,
      itemStyle: {
        color: '#14C814',
        borderColor: 'black',
        opacity: 1
      }
    }
  ];

  // build option for echarts
  const option: EChartsOption = {
    yAxis: {
      type: 'category',
      boundaryGap: true,
      splitArea: {show: false},
      splitLine: {show: false},
      axisLine: {
        show: false,
        onZero: false
      },
      axisTick: {show: false},
      axisLabel: {
        formatter: function (d: any, i) {
          return `${plotData.boxData[i].name}`;
        }
      }
    },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: function (d: any) {
          return `${d}`;
        }
      },
      splitLine: {show: true, interval: 'auto', lineStyle: {color: '#f3f3f3'}},
      splitArea: {show: false},
      axisTick: {show: true},
      axisLine: {show: true}
    },
    // @ts-ignore
    series,
    // dataZoom: [
    //   {
    //     type: 'inside'
    //   },
    //   {
    //     type: 'slider',
    //     height: 15,
    //     bottom: 25,
    //     fillerColor: 'rgba(255,255,255,0.1)'
    //   }
    // ],
    tooltip: {
      trigger: 'item',
      axisPointer: {
        type: 'shadow'
      },
      confine: true
      // extraCssText: 'z-index: 9999;'
      // formatter: function (params: any) {
      //   // ids that associated with the bar
      //   const range = params[1].data.label;
      //   const count = params[1].value;
      //   return `Range: ${range}<br/> # Observations: ${count}`;
      // }
    },
    brush: {
      toolbox: ['rect', 'keep', 'clear'],
      xAxisIndex: 0
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
