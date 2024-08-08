import {ReactNode} from 'react';

/**
 * Type of image message content
 */
export interface MessageImageContentProps {
  src?: string;
  width?: string | number;
  height?: string | number;
  alt?: string;
}

/**
 * Type of message direction
 */
export type MessageDirection = 'incoming' | 'outgoing' | 0 | 1;

/**
 * Type of message type
 */
export type MessageType = 'html' | 'text' | 'image' | 'custom';

/**
 * Type of message content
 */
export type MessagePayload = string | Record<string, any> | MessageImageContentProps | ReactNode;

/**
 * Type of Message model
 *
 * @param message The message to be sent
 * @param sentTime The time the message was sent
 * @param sender The sender of the message
 * @param direction The direction of the message
 * @param position The position of the message
 * @param type The type of the message
 * @param payload The payload of the message, can be string, object, image or custom
 */
export interface MessageModel {
  message?: string;
  sentTime?: string;
  sender?: string;
  direction: MessageDirection;
  position: 'single' | 'first' | 'normal' | 'last' | 0 | 1 | 2 | 3;
  type?: MessageType;
  payload?: MessagePayload;
}

/**
 * Type of Custom function output props
 */
export type CustomFunctionOutputProps<R, D> = {
  /** the type of the function, e.g. plot, map, table etc. */
  type: string;
  // the name of the function, e.g. createMap, createPlot etc.
  name: string;
  // the args of the function, e.g. {datasetId: '123', variable: 'income'}
  args?: Record<string, any>;
  /** flag indicate if the custom function is a intermediate step */
  isIntermediate?: boolean;
  /* the result of the function run, it will be sent back to LLM to parse as response to users */
  result: R;
  /* the data of the function run, it will be used to create the custom message e.g. plot, map etc. */
  data?: D;
};

/**
 * Type of Custom functions, a dictionary of functions e.g. createMap, createPlot etc.
 * key is the name of the function, value is the function itself.
 *
 * The function should return a CustomFunctionOutputProps object, or a Promise of CustomFunctionOutputProps object if it is a async function.
 */
export type CustomFunctions = {
  [key: string]: (
    functionName: string,
    functionArgs: any,
    customFunctionContext: any,
    previousOutput?: CustomFunctionOutputProps<unknown, unknown>[]
  ) =>
    | CustomFunctionOutputProps<unknown, unknown>
    | Promise<CustomFunctionOutputProps<unknown, unknown>>;
};

/**
 * Type of CustomFunctionCall
 *
 */
export type CustomFunctionCall = {
  /** the name of the function */
  functionName: string;
  /** the arguments of the function */
  functionArgs: any;
  /** the output of function execution */
  output: CustomFunctionOutputProps<unknown, unknown>;
};

/**
 * Type of CustomMessageCallback
 *
 * @param customFunctionCall The custom function call
 */
export type CustomMessageCallback = (customFunctionCall: CustomFunctionCall) => MessageModel | null;

/**
 * Context objects for custom functions
 */
export type CustomFunctionContext = {
  [key: string]: any;
};

/**
 * Type of StreamMessageCallback
 *
 * @param deltaMessage The delta message from the assistant
 * @param customMessage The custom message from the custom function
 * @param isCompleted The flag to indicate if the message is completed
 */
export type StreamMessageCallback = (
  deltaMessage: string,
  customMessage?: MessagePayload,
  isCompleted?: boolean
) => void;

/**
 * Type of ProcessMessageProps
 */
export type ProcessMessageProps = {
  textMessage: string;
  imageMessage?: string;
  customFunctions: CustomFunctions;
  customFunctionContext: CustomFunctionContext;
  customMessageCallback: CustomMessageCallback;
  streamMessageCallback: StreamMessageCallback;
};
