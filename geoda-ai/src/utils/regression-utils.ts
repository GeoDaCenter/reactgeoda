import {RegressionDataProps} from '@/actions/regression-actions';
import {linearRegression, LinearRegressionProps} from 'geoda-wasm';

export async function runRegression({
  x,
  y,
  xNames,
  yName,
  weightsId,
  weights,
  datasetName
}: LinearRegressionProps): Promise<RegressionDataProps> {
  const result = await linearRegression({x, y, xNames, yName, weights, datasetName});
  return {
    dependentVariable: yName,
    independentVariables: xNames,
    weights: weightsId,
    dependentVariableData: y,
    independentVariablesData: x,
    result
  };
}
