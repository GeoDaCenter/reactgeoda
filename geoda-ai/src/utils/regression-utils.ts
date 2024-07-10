import {RegressionDataProps} from '@/actions/regression-actions';
import {linearRegression, spatialLag, spatialError, LinearRegressionProps} from 'geoda-wasm';

export async function runRegression(
  model: string,
  {x, y, xNames, yName, weightsId, weights, datasetName}: LinearRegressionProps
): Promise<RegressionDataProps> {
  let result = null;
  if (model === 'classic') {
    result = await linearRegression({x, y, xNames, yName, weightsId, weights, datasetName});
  } else if (model === 'lag') {
    result = await spatialLag({x, y, xNames, yName, weightsId, weights, datasetName});
  } else if (model === 'error') {
    result = await spatialError({x, y, xNames, yName, weightsId, weights, datasetName});
  }
  return {
    dependentVariable: yName,
    independentVariables: xNames,
    weights: weightsId,
    result
  };
}
