import {bin} from 'd3-array';

/**
 * Create a histogram from a list of numbers and a number of bins
 */
export function createHistogram(data: number[], numberOfBins: number) {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    // put the data index into bins, which are separated equally in the range of minVal and maxVal
    const bins = bin().thresholds(numberOfBins).domain([minVal, maxVal])(data);
    // calculate the bin width
    const binWidth = (maxVal - minVal) / numberOfBins;
    // create the histogram, store indexes of data items in each bin
    const histogram = bins.map((bin: any, i: number) => {
        return {
            bin: i,
            binStart: minVal + i * binWidth,
            binEnd: minVal + (i + 1) * binWidth,
            count: bin.length,
            indexes: bin
        };
    });
    console.log(histogram);
    return histogram;
}
