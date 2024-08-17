import KeplerTable from '@kepler.gl/table';
import {
  linearRegression,
  spatialLagRegression,
  spatialError,
  printLinearRegressionResultUsingMarkdown,
  LinearRegressionResult,
  SpatialLagResult,
  SpatialErrorResult,
  printSpatialLagResultUsingMarkdown,
  printSpatialErrorResultUsingMarkdown
} from 'geoda-wasm';
import {getColumnDataFromKeplerDataset} from './data-utils';
import {WeightsProps} from '@/reducers/weights-reducer';
import {RegressionDataProps} from '@/reducers/regression-reducer';

export type RunRegressionProps = {
  keplerDataset: KeplerTable;
  model: string;
  yVariable: string;
  xVariables: string[];
  weights?: WeightsProps;
};

export async function runRegression({
  keplerDataset,
  model,
  xVariables: xNames,
  yVariable: yName,
  weights
}: RunRegressionProps): Promise<RegressionDataProps> {
  let result = null;

  const datasetName = keplerDataset.label;
  // get data from Y variable
  const y = getColumnDataFromKeplerDataset(yName, keplerDataset);
  // get data for X variables
  const x = xNames.map((variable: string) =>
    getColumnDataFromKeplerDataset(variable, keplerDataset)
  );
  // get weights data
  const weightsId = weights?.weightsMeta.id;
  const w = weights?.weights;

  if (model === 'classic') {
    result = await linearRegression({x, y, xNames, yName, weightsId, weights: w, datasetName});
  } else if (model === 'spatial-lag') {
    result = await spatialLagRegression({x, y, xNames, yName, weightsId, weights: w, datasetName});
  } else if (model === 'spatial-error') {
    result = await spatialError({x, y, xNames, yName, weightsId, weights: w, datasetName});
  } else {
    throw new Error(`Invalid regression model: ${model}`);
  }

  return {
    dependentVariable: yName,
    independentVariables: xNames,
    weights: weightsId,
    result
  };
}

// check if the type of regressionReport is LinearRegressionResult
export function isLinearRegressionResult(
  regressionReport: LinearRegressionResult | SpatialLagResult | SpatialErrorResult | null
): regressionReport is LinearRegressionResult {
  return regressionReport?.type === 'linearRegression';
}

// check if the type of regressionReport is SpatialLagResult
export function isSpatialLagResult(
  regressionReport: LinearRegressionResult | SpatialLagResult | SpatialErrorResult | null
): regressionReport is SpatialLagResult {
  return regressionReport?.type === 'spatialLag';
}

// check if the type of regressionReport is SpatialErrorResult
export function isSpatialErrorResult(
  regressionReport: LinearRegressionResult | SpatialLagResult | SpatialErrorResult | null
): regressionReport is SpatialErrorResult {
  return regressionReport?.type === 'spatialError';
}

export const printRegressionResult = (
  report: LinearRegressionResult | SpatialLagResult | SpatialErrorResult | null
) => {
  if (isLinearRegressionResult(report)) {
    return printLinearRegressionResultUsingMarkdown(report);
  } else if (isSpatialLagResult(report)) {
    return printSpatialLagResultUsingMarkdown(report);
  } else if (isSpatialErrorResult(report)) {
    return printSpatialErrorResultUsingMarkdown(report);
  }
  return 'Error: Unknown regression type.';
};
