import React, {useMemo} from 'react';

import {CustomWeightsMessage, isCustomWeightsOutput} from './custom-weights-message';
import {CustomLisaMessage, isCustomLisaOutput} from './custom-lisa-message';
import {CustomHistogramMessage, isCustomHistogramOutput} from './custom-histogram-message';
import {CustomScatterPlotMessage, isCustomScatterPlotOutput} from './custom-scatter-message';
import {CustomBubbleChartMessage} from './custom-bubblechart-message';
import {CustomBoxplotMessage} from './custom-boxplot-message';
import {isCustomBoxPlotOutput} from '@/ai/assistant/callbacks/callback-box';
import {isCustomBubbleChartOutput} from '@/ai/assistant/callbacks/callback-bubble';
import {
  CustomParallelCoordinateMessage,
  isCustomParallelCoordinateOutput
} from './custom-parallel-coordinate-message';
import {CustomSpatialRegressionMessage, isCustomRegressionOutput} from './custom-spreg-message';
import {CustomMapMessage, isCustomMapOutput} from './custom-map-message';
import {
  CustomCreateVariableMessage,
  isCustomCreateVariableOutput
} from './custom-create-variable-message';
import {CustomFunctionOutputProps, MessagePayload} from '@openassistant/core';

export type CustomMessagePayload = {
  type: string;
  functionName: string;
  functionArgs: Record<string, any>;
  output: CustomFunctionOutputProps<unknown, unknown>;
};

// Custom message types, for creating custom message components
// please note: this is not one of the CustomFunctionNames
const VALID_CUSTOM_MESSAGE_TYPES = [
  'mapping',
  'weights',
  'lisa',
  'histogram',
  'scatter',
  'bubble',
  'boxplot',
  'parallel-coordinate',
  'regression',
  'createVariable'
];

// function to type guard the MessagePayload is CustomMessagePayload
export function isCustomMessagePayload(payload: MessagePayload): payload is CustomMessagePayload {
  return (payload as CustomMessagePayload).functionName !== undefined;
}

/**
 * Check if the payload is a valid custom message
 * @param payload The message payload
 * @returns The flag indicates payload is a valid custom message
 */
export function isValidCustomMessage(payload: CustomMessagePayload): boolean {
  if ('type' in payload.output) {
    // check if payload.output.type in VALIDE_CUSTOM_MESSAGE_TYPES
    return VALID_CUSTOM_MESSAGE_TYPES.includes(payload.output.type);
  }
  return false;
}

/**
 * Create a custom message component contains a confirm button with text "Click to Create a Quantile Map"
 */
export function CustomMessage({props}: {props: CustomMessagePayload}) {
  const {functionArgs, output} = props;

  return useMemo(() => {
    const nodeElement = isCustomMapOutput(output) ? (
      <CustomMapMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomWeightsOutput(output) ? (
      <CustomWeightsMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomLisaOutput(output) ? (
      <CustomLisaMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomHistogramOutput(output) ? (
      <CustomHistogramMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomScatterPlotOutput(output) ? (
      <CustomScatterPlotMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomBubbleChartOutput(output) ? (
      <CustomBubbleChartMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomBoxPlotOutput(output) ? (
      <CustomBoxplotMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomParallelCoordinateOutput(output) ? (
      <CustomParallelCoordinateMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomRegressionOutput(output) ? (
      <CustomSpatialRegressionMessage functionOutput={output} functionArgs={functionArgs} />
    ) : isCustomCreateVariableOutput(output) ? (
      <CustomCreateVariableMessage functionOutput={output} functionArgs={functionArgs} />
    ) : null;
    return nodeElement;
  }, [functionArgs, output]);
}
