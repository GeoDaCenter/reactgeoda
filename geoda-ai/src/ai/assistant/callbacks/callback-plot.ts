import {createErrorResult} from '../custom-functions';
import {
  CallbackFunctionProps,
  CustomFunctionCall,
  CustomFunctionContext,
  CustomFunctionOutputProps,
  ErrorCallbackResult,
  RegisterFunctionCallingProps
} from 'react-ai-assist';
import {VisState} from '@kepler.gl/schemas';
import {customHistogramMessageCallback} from '@/components/chatgpt/custom-histogram-message';
import {
  histogramCallback,
  HistogramCallbackData,
  HistogramCallbackResult
} from './callback-histogram';
import {scatterCallback, ScatterCallbackData, ScatterCallbackResult} from './callback-scatter';
import {
  parallelCoordinateCallback,
  ParallelCoordinateCallbackData,
  ParallelCoordinateCallbackResult
} from './callback-pcp';
import {boxplotCallback, BoxPlotCallbackData, BoxPlotCallbackResult} from './callback-box';
import {
  bubbleCallback,
  BubbleChartCallbackData,
  BubbleChartCallbackResult
} from './callback-bubble';
import {ReactNode} from 'react';
import {customBoxPlotMessageCallback} from '@/components/chatgpt/custom-boxplot-message';
import {customScatterPlotMessageCallback} from '@/components/chatgpt/custom-scatter-message';
import {customBubbleChartMessageCallback} from '@/components/chatgpt/custom-bubblechart-message';
import {customPCPMessageCallback} from '@/components/chatgpt/custom-parallel-coordinate-message';

export const createPlotFunctionDefinition = (
  context: CustomFunctionContext<VisState>
): RegisterFunctionCallingProps => ({
  name: 'createPlot',
  description:
    'Create a plot including scatter plot, histogram, boxplot, parallel coordinate plot (PCP), and bubble chart.',
  properties: {
    plotType: {
      type: 'string',
      description:
        'The type of plot to be created. The available options are scatter plot, histogram, box plot, parallel coordinate plot (PCP), and bubble chart.'
    },
    k: {
      type: 'number',
      description:
        'The number of bins or intervals that the data will be group into. The default value is 7.'
    },
    variableName: {
      type: 'string',
      description: 'The name of a numeric variable.'
    },
    variableX: {
      type: 'string',
      description:
        'The name of the variable to be plotted along the X-axis, representing the independent variable.'
    },
    variableY: {
      type: 'string',
      description:
        'The name of the variable to be plotted along the Y-axis, representing the dependent variable or the variable of interest.'
    },
    variableSize: {
      type: 'string',
      description:
        'The name of the variable to be represented by the size of each bubble, adding a third dimensional analysis to the data visualization.'
    },
    variableColor: {
      type: 'string',
      description:
        'Optionally, the name of the variable to be represented by the color of each bubble, possibly to categorize or further differentiate the data points.'
    },
    variableNames: {
      type: 'array',
      items: {
        type: 'string'
      },
      description: 'A list of the variable names'
    },
    datasetName: {
      type: 'string',
      description:
        'The name of the dataset. If not provided, please try to find the dataset name that contains the variableName. The default value is the name of the first dataset.'
    }
  },
  required: ['plotType'],
  callbackFunction: createPlotCallback,
  callbackFunctionContext: context,
  callbackMessage: customPlotMessageCallback
});

export type PlotCallbackResult =
  | HistogramCallbackResult
  | ScatterCallbackResult
  | BoxPlotCallbackResult
  | BubbleChartCallbackResult
  | ParallelCoordinateCallbackResult;

type PlotCallbackData =
  | HistogramCallbackData
  | ScatterCallbackData
  | BoxPlotCallbackData
  | BubbleChartCallbackData
  | ParallelCoordinateCallbackData;

export type CreatePlotCallbackOutput = CustomFunctionOutputProps<
  PlotCallbackResult | ErrorCallbackResult,
  PlotCallbackData
>;

export type CreatePlotCallbackProps = {
  plotType: string;
};

function createPlotCallback({
  functionName,
  functionArgs,
  functionContext
}: CallbackFunctionProps): CreatePlotCallbackOutput {
  const {plotType} = functionArgs as CreatePlotCallbackProps;

  if (plotType === 'histogram') {
    return histogramCallback({functionName, functionArgs, functionContext});
  } else if (plotType === 'boxplot') {
    return boxplotCallback({functionName, functionArgs, functionContext});
  } else if (plotType === 'scatter') {
    return scatterCallback({functionName, functionArgs, functionContext});
  } else if (plotType === 'bubble') {
    return bubbleCallback({functionName, functionArgs, functionContext});
  } else if (plotType === 'parallelCoordinate') {
    return parallelCoordinateCallback({functionName, functionArgs, functionContext});
  }

  return createErrorResult({
    name: functionName,
    result: `The plot type ${plotType} is not supported. Please try scatter, histogram, boxplot, parallelCoordinate, or bubble.`
  });
}

function customPlotMessageCallback({
  functionName,
  functionArgs,
  output
}: CustomFunctionCall): ReactNode | null {
  const {plotType} = functionArgs as CreatePlotCallbackProps;

  if (plotType === 'histogram') {
    return customHistogramMessageCallback({functionName, functionArgs, output});
  } else if (plotType === 'boxplot') {
    return customBoxPlotMessageCallback({functionName, functionArgs, output});
  } else if (plotType === 'scatter') {
    return customScatterPlotMessageCallback({functionName, functionArgs, output});
  } else if (plotType === 'bubble') {
    return customBubbleChartMessageCallback({functionName, functionArgs, output});
  } else if (plotType === 'parallelCoordinate') {
    return customPCPMessageCallback({functionName, functionArgs, output});
  }

  return null;
}
