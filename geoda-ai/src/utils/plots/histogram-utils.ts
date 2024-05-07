import {HistogramPlotProps} from '@/actions';
import {bin as d3bin} from 'd3-array';
import {EChartsOption} from 'echarts';
import {numericFormatter} from './format-utils';

export type HistogramDataItemProps = {
  index: number;
  value: number;
};

export type HistogramDataProps = {
  bin: number;
  binStart: number;
  binEnd: number;
  count: number;
  items: HistogramDataItemProps[];
};

/**
 * Create a histogram from a list of numbers and a number of bins
 */
export function createHistogram(data: number[], numberOfBins: number): HistogramDataProps[] {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  // create a dictionary to store value and index of data
  const dataDict: Array<HistogramDataItemProps> = data.map((d: number, i: number) => {
    return {index: i, value: d};
  });
  // put the data index into bins, which are separated equally in the range of minVal and maxVal
  // the domain will be uniformly divided into approximately count bins
  const binning = d3bin().thresholds(numberOfBins).domain([minVal, maxVal]);
  // @ts-expect-error NOTE: d3-array types doesn't include the custom value accessor, but this works in d3-array
  const bins = binning.value((d: HistogramDataItemProps) => d.value)(dataDict);
  // calculate the bin width
  const binWidth = (maxVal - minVal) / numberOfBins;
  // create the histogram, store indexes of data items in each bin
  const histogram = bins.map((bin: any, i: number) => {
    return {
      bin: i,
      binStart: minVal + i * binWidth,
      binEnd: minVal + (i + 1) * binWidth,
      count: bin.length,
      items: bin
    };
  });
  return histogram;
}

export const defaultBarColors = ['#FF6B6B', '#48BB78', '#4299E1', '#ED64A6', '#F6E05E'];

export function getHistogramChartOption(filteredIndex: number[] | null, props: HistogramPlotProps) {
  const hasHighlighted = filteredIndex && filteredIndex.length > 0;

  // create a dictionary to store the indexes of data items that have been filtered
  const filteredIndexDict: {[key: number]: boolean} = {};
  if (hasHighlighted) {
    filteredIndex.forEach((d: number) => {
      filteredIndexDict[d] = true;
    });
  }

  // build highlighted bars from filteredIndex and filteredIndexDict
  const highlightedBars = props.data.map((d: HistogramDataProps, i: number) => {
    const highlightedIds = d.items.reduce((acc: number[], d: HistogramDataItemProps) => {
      if (filteredIndexDict[d.index] === true) {
        acc.push(d.index);
      }
      return acc;
    }, []);
    return {
      value: hasHighlighted ? highlightedIds?.length : 0,
      itemStyle: {
        color: defaultBarColors[i % defaultBarColors.length],
        opacity: 1
      },
      label: `[${d.binStart.toFixed(1)} - ${d.binEnd.toFixed(1)}]`,
      // ids that associated with the bar and been filtered
      ids: hasHighlighted ? highlightedIds : 0
    };
  });

  // get plotData from props.data
  const plotData: HistogramDataProps[] = props.data;

  // use binStart values as the x axis tick values
  // const xTickValues = plotData.map((d: HistogramDataProps) => d.binStart.toFixed(1));

  // get min value from plotData
  const minValue = plotData[0].binStart;
  const maxValue = plotData[plotData.length - 1].binEnd;
  const numBins = plotData.length;
  const interval = (maxValue - minValue) / numBins;

  // get bar data from plotData
  const barData = plotData.map((d: HistogramDataProps, i: number) => {
    return {
      value: hasHighlighted ? d.count - highlightedBars[i].value : d.count,
      itemStyle: {
        color: defaultBarColors[i % defaultBarColors.length],
        opacity: hasHighlighted ? 0.5 : 1,
        shadowBlur: 10,
        shadowColor: 'rgba(0,0,0,0.3)'
      },
      label: `[${d.binStart.toFixed(1)} - ${d.binEnd.toFixed(1)}]`,
      // ids that associated with the bar and been filtered
      ids: d.items.map((d: HistogramDataItemProps) => d.index)
    };
  });

  const series = [
    {
      data: highlightedBars,
      type: 'bar',
      barWidth: '90%',
      stack: 'total',
      xAxisIndex: 0
    },
    {
      data: barData,
      type: 'bar',
      barWidth: '90%',
      stack: 'total',
      xAxisIndex: 0,
      label: {
        show: false,
        position: [0, -15],
        formatter: function (params: {value: any}) {
          return params.value; //display series name
        }
      }
    }
  ];

  // build option for echarts
  const option: EChartsOption = {
    xAxis: [
      {
        type: 'category',
        // data: xTickValues,
        // axisLabel: {
        //   interval: 0,
        //   hideOverlap: true
        // },
        // axisTick: {
        //   alignWithLabel: false,
        //   interval: 0
        // },
        axisTick: {show: false},
        axisLabel: {show: false},
        axisLine: {show: false},
        position: 'bottom'
      },
      {
        scale: true,
        type: 'value',
        min: minValue,
        max: maxValue,
        interval: interval,
        axisLabel: {
          hideOverlap: true,
          rotate: 35,
          overflow: 'truncate',
          formatter: numericFormatter
        },
        splitLine: {
          show: false
        },
        position: 'bottom'
      }
    ],
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: numericFormatter
      },
      splitLine: {
        show: true
      },
      axisTick: {show: false},
      axisLine: {show: false}
    },
    // @ts-ignore
    series,
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params: any) {
        // ids that associated with the bar
        const range = params[1].data.label;
        const count = params[1].value;
        return `Range: ${range}<br/> # Observations: ${count}`;
      }
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
    ]
  };

  return option;
}
