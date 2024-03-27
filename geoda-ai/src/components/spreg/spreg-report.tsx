import {RegressionProps} from '@/actions/regression-actions';
import {Card, CardBody, CardHeader, ScrollShadow} from '@nextui-org/react';
import {printLinearRegressionResultUsingMarkdown} from 'geoda-wasm';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// format dependent variable and independent variables as y ~ x1 + x2 + x3
const formatEquation = (y: string, x: string[]) => `${y} ~ ${x.join(' + ')}`;

export const RegressionReport = ({regression}: {regression: RegressionProps}) => {
  const regReport = regression.data.result;
  return (
    <Card key={regression.id} className="p-0">
      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
        <p className="text-xs font-bold uppercase">{regReport.title}</p>
        <small className="text-default-500">
          {formatEquation(regReport.dependentVariable, regReport.independentVariables)}
        </small>
      </CardHeader>
      <CardBody>
        <ScrollShadow className="h-[400px] w-[500px]">
          <div className="flex w-full flex-col gap-2 rounded-none">
            <div className="p-4 font-mono text-tiny">
              <Markdown remarkPlugins={[remarkGfm]}>
                {printLinearRegressionResultUsingMarkdown(regression.data.result)}
              </Markdown>
            </div>
          </div>
        </ScrollShadow>
      </CardBody>
    </Card>
  );
};
