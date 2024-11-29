import {mean, standardDeviation} from 'simple-statistics';
// @ts-ignore
import jStat from 'jstat';

export function standardize(data: number[]): number[] {
  const meanValue = mean(data);
  const stdValue = standardDeviation(data);
  return data.map(value => (value - meanValue) / stdValue);
}

// for linear regression calculation
export function calculateLinearRegression(xData: number[], yData: number[]) {
  const n = xData.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += xData[i];
    sumY += yData[i];
    sumXY += xData[i] * yData[i];
    sumXX += xData[i] * xData[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return {slope, intercept};
}

export type LoessResult = {
  fitted: [number, number][];
  upper: [number, number][];
  lower: [number, number][];
};

export function calculateLoessRegression(
  xData: number[],
  yData: number[],
  bandwidth = 0.2,
  steps = 100,
  confidenceLevel = 0.95
): LoessResult {
  const n = xData.length;
  const t = jStat.studentt.inv((1 + confidenceLevel) / 2, n - 2);

  // Sort x values and rearrange y accordingly
  const sorted = xData.map((x, i) => ({x, y: yData[i]})).sort((a, b) => a.x - b.x);
  const sortedX = sorted.map(p => p.x);
  const sortedY = sorted.map(p => p.y);

  const minX = Math.min(...xData);
  const maxX = Math.max(...xData);
  const span = maxX - minX;

  const fitted: [number, number][] = [];
  const upper: [number, number][] = [];
  const lower: [number, number][] = [];

  for (let i = 0; i < steps; i++) {
    const x = minX + (span * i) / (steps - 1);
    let weightedSum = 0;
    let weightSum = 0;
    const weights: number[] = [];

    // Calculate weights and weighted sum
    for (let j = 0; j < n; j++) {
      const distance = Math.abs(x - sortedX[j]);
      const weight = Math.pow(1 - Math.pow(Math.min(1, distance / (bandwidth * span)), 3), 3);
      weights.push(weight);
      weightedSum += weight * sortedY[j];
      weightSum += weight;
    }

    // Calculate fitted value
    const fittedValue = weightSum !== 0 ? weightedSum / weightSum : 0;

    // Calculate standard error for confidence interval
    let sumSquaredResiduals = 0;
    let sumSquaredWeights = 0;

    for (let j = 0; j < n; j++) {
      const residual = sortedY[j] - fittedValue;
      sumSquaredResiduals += weights[j] * residual * residual;
      sumSquaredWeights += weights[j] * weights[j];
    }

    const standardError = Math.sqrt(
      (sumSquaredResiduals / (n - 2)) *
        (1 / weightSum + sumSquaredWeights / (weightSum * weightSum))
    );

    const margin = t * standardError;

    fitted.push([x, fittedValue]);
    upper.push([x, fittedValue + margin]);
    lower.push([x, fittedValue - margin]);
  }

  return {fitted, upper, lower};
}

/**
 * Performs Chow test to check for structural break in linear regression
 * @param x1 First subset x values
 * @param y1 First subset y values
 * @param x2 Second subset x values
 * @param y2 Second subset y values
 * @returns Object containing F-statistic and p-value
 */
export type ChowTestResult = {
  fStat: number;
  pValue: number;
};

function calculateSSR(x: number[], y: number[]): number {
  const n = x.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumXX += x[i] * x[i];
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let ssr = 0;
  for (let i = 0; i < n; i++) {
    const predicted = slope * x[i] + intercept;
    ssr += Math.pow(y[i] - predicted, 2);
  }

  return ssr;
}

export function chowTest(x1: number[], y1: number[], x2: number[], y2: number[]): ChowTestResult {
  // Calculate SSR for pooled data
  const xPooled = [...x1, ...x2];
  const yPooled = [...y1, ...y2];
  const ssrPooled = calculateSSR(xPooled, yPooled);

  // Calculate SSR for each subset
  const ssr1 = calculateSSR(x1, y1);
  const ssr2 = calculateSSR(x2, y2);

  const n1 = x1.length;
  const n2 = x2.length;
  const k = 2; // number of parameters (slope and intercept)

  // Calculate F-statistic
  const numerator = (ssrPooled - (ssr1 + ssr2)) / k;
  const denominator = (ssr1 + ssr2) / (n1 + n2 - 2 * k);
  const fStat = numerator / denominator;

  // Calculate p-value using F-distribution
  const pValue = 1 - jStat.centralF.cdf(fStat, k, n1 + n2 - 2 * k);

  return {fStat, pValue};
}
