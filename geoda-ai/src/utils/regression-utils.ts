import KeplerTable from '@kepler.gl/table';
import {linearRegression, spatialLagRegression, spatialError} from 'geoda-wasm';
import {getColumnDataFromKeplerDataset} from './data-utils';
import {WeightsProps} from '@/reducers/weights-reducer';
import {RegressionDataProps} from '@/reducers/regression-reducer';

export type RunRegressionProps = {
  keplerDataset: KeplerTable;
  model: string;
  yVariable: string;
  xVariables: string[];
  weightsId: string;
  weights: WeightsProps[];
};

export async function runRegression({
  keplerDataset,
  model,
  xVariables: xNames,
  yVariable: yName,
  weightsId,
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
  const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === weightsId);
  const w = selectedWeightData?.weights;

  if (model === 'classic') {
    result = await linearRegression({x, y, xNames, yName, weightsId, weights: w, datasetName});
  } else if (model === 'lag') {
    result = await spatialLagRegression({x, y, xNames, yName, weightsId, weights: w, datasetName});
  } else if (model === 'error') {
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
