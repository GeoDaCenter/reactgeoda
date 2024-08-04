import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {CUSTOM_FUNCTIONS} from '@/ai/assistant/custom-functions';
import {
  CustomFunctionContext,
  CustomFunctionOutputProps,
  CustomFunctions,
  initOpenAI,
  processMessage,
  translateVoiceToText
} from '@/ai/openai-utils';

/**
 * Create a message from custom function call
 * Return a message object that prompts user a confirm button, a plot or a map.
 */
function createMessageFromCustomFunctionCall({
  functionName,
  functionArgs,
  output
}: {
  functionName: string;
  functionArgs: Record<string, unknown>;
  output: CustomFunctionOutputProps;
}): MessageModel | null {
  const type = 'custom';
  const message = '';
  const sender = 'GeoDa.AI';
  const direction = 'incoming';
  const position = 'normal';
  const payload = {
    type: 'custom',
    functionName,
    functionArgs,
    output
  };

  // get values from enum CustomFunctionNames
  const allFunctions = Object.keys(CUSTOM_FUNCTIONS);
  // remove 'summarizeData' from allFunctions
  const functionsWithCustomMessage = allFunctions.filter(funcName => funcName !== 'summarizeData');
  // return custom message
  if (functionsWithCustomMessage.includes(functionName)) {
    return {
      type,
      message,
      sender,
      direction,
      position,
      payload
    };
  }
  return null;
}

/**
 * Custom hook to use ChatGPT
 *
 * registerFunction({functionName: 'summarizeData', functionArgs: {tableName}, input: {}})
 * registerFunctionContext({var1, var2}), variables will be accessible by registered functions
 * registerFunctionMessage({functionName: 'summarizeData', functionArgs: {tableName}, output: {result: {}}}), return React.JSX.Element
 */
export function useChatGPT({
  customFunctions,
  customFunctionContext = {}
}: {
  customFunctions: CustomFunctions;
  customFunctionContext: CustomFunctionContext;
}) {
  /**
   * Process message by sending message to LLM assistant and retrieving response
   * @returns None
   */
  async function sendMessage(
    textMessage: string,
    streamMessage: (delta: string, customMessage?: MessageModel) => void,
    imageMessage?: string
  ) {
    await processMessage({
      textMessage,
      imageMessage,
      customFunctions,
      customFunctionContext,
      customMessageCallback: createMessageFromCustomFunctionCall,
      streamMessageCallback: streamMessage
    });
  }

  /**
   * Convert speech to text
   * @param audioBlob The audio blob to convert to text
   * @returns The text from the audio blob
   */
  async function speechToText(audioBlob: Blob) {
    // implement speech to text
    return translateVoiceToText(audioBlob);
  }

  return {initOpenAI, sendMessage, speechToText};
}
