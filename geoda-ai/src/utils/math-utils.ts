import {mean, standardDeviation} from 'simple-statistics';

export function standardize(data: number[]): number[] {
  const meanValue = mean(data);
  const stdValue = standardDeviation(data);
  return data.map(value => (value - meanValue) / stdValue);
}
