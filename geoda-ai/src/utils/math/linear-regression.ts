export type RegressionResults = {
  rSquared: number;
  intercept: {
    estimate: number;
    standardError: number;
    tStatistic: number;
    pValue: number;
  };
  slope: {
    estimate: number;
    standardError: number;
    tStatistic: number;
    pValue: number;
  };
};

export function linearRegression(x: number[], y: number[]): RegressionResults {
  if (x.length !== y.length || x.length < 2) {
    // Input arrays must have the same length and contain at least 2 points'
    // return zero regression results
    return {
      rSquared: 0,
      intercept: {estimate: 0, standardError: 0, tStatistic: 0, pValue: 0},
      slope: {estimate: 0, standardError: 0, tStatistic: 0, pValue: 0}
    };
  }

  const n = x.length;

  // Calculate means
  const xMean = x.reduce((sum, val) => sum + val, 0) / n;
  const yMean = y.reduce((sum, val) => sum + val, 0) / n;

  // Calculate sums of squares
  let xxSum = 0,
    xySum = 0,
    yySum = 0;
  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    xxSum += xDiff * xDiff;
    xySum += xDiff * yDiff;
    yySum += yDiff * yDiff;
  }

  // Calculate slope and intercept
  const slope = xySum / xxSum;
  const intercept = yMean - slope * xMean;

  // Calculate predicted values and residuals
  const predicted = x.map(xi => slope * xi + intercept);
  const residuals = y.map((yi, i) => yi - predicted[i]);

  // Calculate R-squared
  const totalSS = yySum;
  const residualSS = residuals.reduce((sum, r) => sum + r * r, 0);
  const rSquared = 1 - residualSS / totalSS;

  // Calculate standard errors and t-statistics
  const mse = residualSS / (n - 2); // Mean squared error
  const slopeStdError = Math.sqrt(mse / xxSum);
  const interceptStdError = Math.sqrt(mse * (1 / n + (xMean * xMean) / xxSum));

  const slopeTStat = slope / slopeStdError;
  const interceptTStat = intercept / interceptStdError;

  // Calculate p-values using t-distribution
  const slopePValue = 2 * (1 - tCDF(Math.abs(slopeTStat), n - 2));
  const interceptPValue = 2 * (1 - tCDF(Math.abs(interceptTStat), n - 2));

  return {
    rSquared,
    intercept: {
      estimate: intercept,
      standardError: interceptStdError,
      tStatistic: interceptTStat,
      pValue: interceptPValue
    },
    slope: {
      estimate: slope,
      standardError: slopeStdError,
      tStatistic: slopeTStat,
      pValue: slopePValue
    }
  };
}

// Helper function to calculate t-distribution CDF
function tCDF(t: number, df: number): number {
  // This is a simplified approximation of the t-distribution CDF
  // For more accurate results, you might want to use a statistical library
  const x = df / (df + t * t);
  return 1 - 0.5 * incompleteBeta(x, df / 2, 0.5);
}

// Helper function for incomplete beta function (simplified version)
function incompleteBeta(x: number, a: number, b: number): number {
  // This is a very simplified version
  // For production use, consider using a statistical library
  const maxIterations = 100;
  let sum = 0;
  let term = 1;

  for (let i = 0; i < maxIterations; i++) {
    term *= ((a + i) * x) / (a + b + i);
    sum += term;
    if (Math.abs(term) < 1e-10) break;
  }

  return Math.pow(x, a) * sum;
}
