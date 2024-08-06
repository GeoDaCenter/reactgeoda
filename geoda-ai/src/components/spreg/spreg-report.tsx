import {RegressionProps} from '@/reducers/regression-reducer';
import {Card, CardBody, CardHeader, ScrollShadow} from '@nextui-org/react';
import {
  printLinearRegressionResultUsingMarkdown,
  LinearRegressionResult,
  SpatialLagResult,
  SpatialErrorResult,
  printSpatialLagResultUsingMarkdown,
  printSpatialErrorResultUsingMarkdown
} from 'geoda-wasm';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// format dependent variable and independent variables as y ~ x1 + x2 + x3
const formatEquation = (y: string, x: string[]) => `${y} ~ ${x.join(' + ')}`;

// check if the type of regressionReport is LinearRegressionResult
export function isLinearRegressionResult(
  regressionReport: any
): regressionReport is LinearRegressionResult {
  return regressionReport.type === 'linearRegression';
}

// check if the type of regressionReport is SpatialLagResult
export function isSpatialLagResult(regressionReport: any): regressionReport is SpatialLagResult {
  return regressionReport.type === 'spatialLag';
}

// check if the type of regressionReport is SpatialErrorResult
export function isSpatialErrorResult(
  regressionReport: any
): regressionReport is SpatialErrorResult {
  return regressionReport.type === 'spatialError';
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

export const RegressionReport = ({
  regression,
  height,
  width
}: {
  regression: RegressionProps;
  height?: number;
  width?: number;
}) => {
  const regReport = regression.data.result;
  return regReport ? (
    <Card key={regression.id} className="p-0">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-xs font-bold uppercase">{regReport.title}</p>
        <small className="text-default-500">
          {formatEquation(regReport.dependentVariable, regReport.independentVariables)}
        </small>
      </CardHeader>
      <CardBody>
        <ScrollShadow className={height && width ? `h-[${height}px] w-[${width}px]` : ''}>
          <div className="flex w-[800px] flex-col gap-2 rounded-none">
            <div className="p-4 font-mono text-tiny">
              <Markdown remarkPlugins={[remarkGfm]}>{printRegressionResult(regReport)}</Markdown>
            </div>
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  ) : null;
};
