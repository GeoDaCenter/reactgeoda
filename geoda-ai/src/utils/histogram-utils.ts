import {bin} from 'd3-array';

type DataItemProps = {
  index: number;
  value: number;
};

export type HistogramDataProps = {
  bin: number;
  binStart: number;
  binEnd: number;
  count: number;
  items: DataItemProps[];
};

/**
 * Create a histogram from a list of numbers and a number of bins
 */
export function createHistogram(data: number[], numberOfBins: number): HistogramDataProps {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  // create a dictionary to store value and index of data
  const dataDict: Array<DataItemProps> = data.map((d: number, i: number) => {
    return {index: i, value: d};
  });
  // put the data index into bins, which are separated equally in the range of minVal and maxVal
  const bins = bin()
    .thresholds(numberOfBins)
    .domain([minVal, maxVal])
    .value((d: DataItemProps) => d.value)(dataDict);
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
  console.log(histogram);
  return histogram;
}
