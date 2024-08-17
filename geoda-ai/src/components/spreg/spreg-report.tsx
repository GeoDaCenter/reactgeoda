import {RegressionProps} from '@/reducers/regression-reducer';
import {printRegressionResult} from '@/utils/regression-utils';
import {Card, CardBody, CardHeader, ScrollShadow} from '@nextui-org/react';

import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// format dependent variable and independent variables as y ~ x1 + x2 + x3
const formatEquation = (y: string, x: string[]) => `${y} ~ ${x.join(' + ')}`;

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
