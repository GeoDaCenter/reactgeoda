import React from 'react';

import {CustomFunctionNames} from '@/utils/custom-functions';
import {CustomWeightsMessage} from './custom-weights-message';
import {CustomLocalMoranMessage} from './custom-lisa-message';
import {CustomHistogramMessage} from './custom-histogram-message';
import {CustomScatterplotMessage} from './custom-scatter-message';
import {CustomBubbleChartMessage} from './custom-bubblechart-message';
import {CustomBoxplotMessage} from './custom-boxplot-message';
import {CustomParallelCoordinateMessage} from './custom-parallel-coordinate-message';
import {CustomSpregMessage} from './custom-spreg-message';
import {MessagePayload} from '@chatscope/chat-ui-kit-react';
import {CustomMapMessage} from './custom-map-message';
import {CustomCreateVariableMessage} from './custom-create-variable-message';
import {CustomFunctionOutputProps} from '@/ai/openai-utils';

export type CustomMessagePayload = {
  type: string;
  // one of the CustomFunctionNames
  functionName: CustomFunctionNames;
  functionArgs: Record<string, any>;
  output: CustomFunctionOutputProps;
};

// function to type guard the MessagePayload is CustomMessagePayload
export function isCustomMessagePayload(payload: MessagePayload): payload is CustomMessagePayload {
  return (payload as CustomMessagePayload).functionName !== undefined;
}

/**
 * Create a custom message component contains a confirm button with text "Click to Create a Quantile Map"
 */
export function CustomMessage({props}: {props: MessagePayload}) {
  return (
    isCustomMessagePayload(props) &&
    'type' in props.output && (
      <>
        {props.output.type === 'mapping' && <CustomMapMessage props={props} />}
        {props.output.type === 'weights' && <CustomWeightsMessage props={props} />}
        {props.output.type === 'lisa' && <CustomLocalMoranMessage props={props} />}
        {props.output.type === 'histogram' && <CustomHistogramMessage props={props} />}
        {props.output.type === 'scatter' && <CustomScatterplotMessage props={props} />}
        {props.output.type === 'bubble' && <CustomBubbleChartMessage props={props} />}
        {props.output.type === 'boxplot' && <CustomBoxplotMessage props={props} />}
        {props.output.type === 'parallel-coordinate' && (
          <CustomParallelCoordinateMessage props={props} />
        )}
        {props.output.type === 'linearRegression' && <CustomSpregMessage props={props} />}
        {props.output.type === 'createVariable' && <CustomCreateVariableMessage props={props} />}
      </>
    )
  );
}
