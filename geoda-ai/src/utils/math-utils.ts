import {mean, standardDeviation} from 'simple-statistics';
import jStat from 'jstat';

export function standardize(data: number[]): number[] {
  const meanValue = mean(data);
  const stdValue = standardDeviation(data);
  return data.map(value => (value - meanValue) / stdValue);
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
