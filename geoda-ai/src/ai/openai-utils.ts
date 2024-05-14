import OpenAI from 'openai';
import {ReactNode} from 'react';

export interface MessageImageContentProps {
  src?: string;
  width?: string | number;
  height?: string | number;
  alt?: string;
}
export type MessageDirection = 'incoming' | 'outgoing' | 0 | 1;
export type MessageType = 'html' | 'text' | 'image' | 'custom';
export type MessagePayload = string | Record<string, any> | MessageImageContentProps | ReactNode;

export interface MessageModel {
  message?: string;
  sentTime?: string;
  sender?: string;
  direction: MessageDirection;
  position: 'single' | 'first' | 'normal' | 'last' | 0 | 1 | 2 | 3;
  type?: MessageType;
  payload?: MessagePayload;
}

const ASSISTANT_ID = 'asst_nowaCi4DNY6SwLJIiLtDOuLG';

// declare global openai variable
let openai: OpenAI | null = null;
// global openai assistant
let assistant: OpenAI.Beta.Assistants.Assistant | null = null;
// global openai thread
let thread: OpenAI.Beta.Threads.Thread | null = null;

/**
 * Initialize ChatGPT assistant by passing the summary of the table from duckdb
 * @param apiKey
 */
export async function initOpenAI(apiKey: string) {
  if (!openai) {
    openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
    // retrive assistant
    assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID || '');
    // create a thread
    thread = await openai.beta.threads.create();
  }
}

export type CustomFunctionOutputProps =
  | {
      type: string;
      name: string;
      result: unknown;
      data?: unknown;
    }
  | {
      result: unknown;
    };

// key is the name of the function, value is the function itself
export type CustomFunctions = {
  [key: string]: (...args: any[]) => CustomFunctionOutputProps | Promise<CustomFunctionOutputProps>;
};

// define type for customMessageCallback
export type CustomMessageCallback = (customFunctionCall: CustomFunctionCall) => MessageModel | null;

// define type for customFunctionContext

// define type for streamMessageCallback
export type StreamMessageCallback = (deltaMessage: string, customMessage?: MessageModel) => void;

export type CustomFunctionCall = {
  functionName: string;
  functionArgs: {};
  output: CustomFunctionOutputProps;
};

export type ProcessMessageProps = {
  question: string;
  customFunctions: CustomFunctions;
  customFunctionContext: Object;
  customMessageCallback: CustomMessageCallback;
  streamMessageCallback: StreamMessageCallback;
};

/**
 * Process message by sending message to ChatGPT assistant and retrieving response
 * @returns
 */
export async function processMessage({
  question,
  customFunctions,
  customFunctionContext,
  customMessageCallback,
  streamMessageCallback
}: ProcessMessageProps) {
  if (!openai || !thread || !assistant) return [];
  // pass in the user question into the existing thread
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: question
  });

  // create a run with stream
  const run = await openai.beta.threads.runs
    .stream(thread.id, {
      assistant_id: assistant.id
    })
    .on('textDelta', (textDelta, snapshot) => {
      streamMessageCallback(snapshot.value || '');
    })
    .on('end', async () => {
      await processRequiresAction(
        customFunctions,
        customFunctionContext,
        customMessageCallback,
        streamMessageCallback
      );
    });

  // final run
  const result = await run.finalRun();
  console.log('Run Result' + result);
}

async function processRequiresAction(
  customFunctions: CustomFunctions,
  customFunctionContext: Object,
  customMessageCallback: CustomMessageCallback,
  streamMessageCallback: StreamMessageCallback
) {
  if (openai && thread) {
    const runs = await openai.beta.threads.runs.list(thread.id);
    const curr_run = runs.data.find(run => run.status === 'requires_action');
    // Details on the action required to continue the run.
    // Details on the tool outputs needed for this run to continue.
    // A list of the relevant tool calls (functions).
    curr_run?.required_action?.submit_tool_outputs.tool_calls.forEach(async toolCall => {
      // handle each tool call (function)
      let result;
      let output: CustomFunctionOutputProps | null = null;
      let error = null;
      // run custom function
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      try {
        const func = customFunctions[functionName];
        output = await func(args, customFunctionContext);
        result = output.result;
      } catch (err) {
        console.error(err);
        error = err;
        // make sure to return something back to openai when the function execution fails
        result = `The function "${functionName}" is not executed. You can contact GeoDa.AI team for assistance. The error message is: ${error}`;
      }

      // submit tool outputs
      if (openai && thread) {
        const responseStream = openai.beta.threads.runs.submitToolOutputsStream(
          thread.id,
          curr_run.id,
          {
            tool_outputs: [
              {
                tool_call_id: toolCall.id,
                output: JSON.stringify(result)
              }
            ]
          }
        );
        let lastMessage = '';
        responseStream
          .on('textDelta', (textDelta, snapshot) => {
            lastMessage = snapshot.value || '';
            streamMessageCallback(snapshot.value || '');
          })
          .on('end', () => {
            if (error === null && output) {
              // append a custom response e.g. plot, map etc. if needed
              const lastCustomFunctionCall = {functionName, functionArgs: args, output};
              const customReponseMsg = customMessageCallback(lastCustomFunctionCall);
              if (customReponseMsg) {
                streamMessageCallback(lastMessage, customReponseMsg);
              }
            }
          });
      }
    });
  }
}
