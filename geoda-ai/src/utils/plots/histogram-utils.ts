import {bin as d3bin} from 'd3-array';

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
