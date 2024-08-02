import {DataContainerInterface} from '@kepler.gl/utils';
import {linearRegression, printLinearRegressionResult} from 'geoda-wasm';

import {RegressionDataProps} from '@/reducers/regression-reducer';
import {getColumnData} from '@/utils/data-utils';
import {WeightsProps} from '@/reducers/weights-reducer';

type LinearRegressionCallbackFuncProps = Pick<
  RegressionDataProps,
  'dependentVariable' | 'independentVariables'
> & {weightsId: string};

export async function linearRegressionCallbackFunc(
  {dependentVariable, independentVariables, weightsId}: LinearRegressionCallbackFuncProps,
  {
    tableName,
    dataContainer,
    weights
  }: {tableName: string; dataContainer: DataContainerInterface; weights: WeightsProps[]}
) {
  // get data for dependent variable
  const dependentVariableData = getColumnData(dependentVariable, dataContainer);
  // get data for independent variables
  const independentVariablesData = independentVariables.map(variable =>
    getColumnData(variable, dataContainer)
  );
  // get weights data
  const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === weightsId)?.weights;

  const regression = await linearRegression({
    x: independentVariablesData,
    y: dependentVariableData,
    xNames: independentVariables,
    yName: dependentVariable,
    weights: selectedWeightData,
    ...(selectedWeightData ? {weightsId} : {}),
    datasetName: tableName
  });

  const regressionReport = printLinearRegressionResult(regression);

  return {
    type: 'linearRegression',
    name: 'Linear Regression',
    result: {
      dependentVariable,
      independentVariables,
      weights: weightsId,
      result: regressionReport
    },
    data: {
      dependentVariable,
      independentVariables,
      weights: weightsId,
      result: regression
    }
  };
}
