import OpenAI from 'openai';
import {ReactNode} from 'react';
import {GEODA_AI_ASSISTANT_BODY, GEODA_AI_ASSISTANT_VERSION} from './assistant/geoda-assistant';

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

// declare global openai variable
let openai: OpenAI | null = null;
// global openai assistant
let assistant: OpenAI.Beta.Assistants.Assistant | undefined = undefined;
// global openai thread
let thread: OpenAI.Beta.Threads.Thread | null = null;

/**
 * Find if the assistant with name 'geoda.ai-openai-agent' exists
 */
export async function findAssistant(openai: OpenAI): Promise<OpenAI.Beta.Assistant | undefined> {
  const assistants = await openai.beta.assistants.list();
  return assistants.data.find(assistant => assistant.name === 'geoda.ai-openai-agent');
}

/**
 * Create a new GeoDa.AI assistant
 */
export async function createAssistant(openai: OpenAI): Promise<OpenAI.Beta.Assistant | undefined> {
  const assistant = await openai.beta.assistants.create(GEODA_AI_ASSISTANT_BODY);
  return assistant;
}

/**
 * Initialize ChatGPT assistant by passing the summary of the table from duckdb
 * @param apiKey
 */
export async function initOpenAI(apiKey: string) {
  if (!openai) {
    openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
    // find GeoDa.Ai assistant
    assistant = await findAssistant(openai);

    // create or update GeoDa.Ai assistant if needed
    if (!assistant) {
      // create a new assistant
      assistant = await createAssistant(openai);
    } else {
      // check if assistant is latest
      const assistantId = assistant.id;
      if (
        assistant.metadata &&
        typeof assistant.metadata === 'object' &&
        'version' in assistant.metadata
      ) {
        const version = assistant.metadata.version;
        if (version !== GEODA_AI_ASSISTANT_VERSION) {
          // update assistant
          assistant = await openai.beta.assistants.update(assistantId, GEODA_AI_ASSISTANT_BODY);
        }
      }
    }

    // create a thread
    thread = await openai.beta.threads.create();
  }
}

/**
 * Cancel the openai assistant run
 */
export async function cancelOpenAI() {
  if (openai && thread) {
    const runs = await openai.beta.threads.runs.list(thread.id);
    runs.data.forEach(async run => {
      if (openai && thread) {
        await openai.beta.threads.runs.cancel(thread.id, run.id);
      }
    });
  }
}

/**
 * Close the openai assistant
 */
export async function closeOpenAI() {
  if (openai && thread) {
    await cancelOpenAI();
    await openai.beta.threads.del(thread.id);
  }
  assistant = undefined;
  thread = null;
}

/**
 * Type of Custom function output props
 */
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
export type StreamMessageCallback = (
  deltaMessage: string,
  customMessage?: MessageModel,
  isCompleted?: boolean
) => void;

export type CustomFunctionCall = {
  functionName: string;
  functionArgs: {};
  output: CustomFunctionOutputProps;
};

export type ProcessMessageProps = {
  question: string;
  imageMessage?: string;
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
  imageMessage,
  customFunctions,
  customFunctionContext,
  customMessageCallback,
  streamMessageCallback
}: ProcessMessageProps) {
  if (!openai || !thread || !assistant) return [];

  // pass in the user question into the existing thread
  if (imageMessage) {
    const imageMessageContent: OpenAI.Beta.Threads.ImageURLContentBlock = {
      type: 'image_url',
      image_url: {
        url: imageMessage || '',
        detail: 'high'
      }
    };
    let lastMessage = '';
    // request chat completion
    await openai.beta.chat.completions
      .stream({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: question
              },
              imageMessageContent
            ]
          }
        ]
      })
      .on('chunk', chunk => {
        const delta = chunk.choices[0]?.delta?.content;
        lastMessage += delta;
        streamMessageCallback(lastMessage);
      })
      .on('finalChatCompletion', completion => {
        streamMessageCallback(completion.choices[0]?.message.content || '', undefined, true);
      });
    return;
  }

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
  run.finalRun();
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

    let previousFunctionName: string | null = null;
    // Details on the action required to continue the run.
    // Details on the tool outputs needed for this run to continue.
    // A list of the relevant tool calls (functions).
    curr_run?.required_action?.submit_tool_outputs.tool_calls.forEach(async toolCall => {
      // handle each tool call (function)
      let result;
      let output: CustomFunctionOutputProps | null = null;
      // run custom function
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      // prevent running the same function (with different arguments) multiple times
      if (previousFunctionName !== functionName) {
        let error = null;
        try {
          const func = customFunctions[functionName];
          output = await func(args, customFunctionContext);
          result = output.result;
        } catch (err) {
          console.error(err);
          error = err;
          // make sure to return something back to openai when the function execution fails
          result = {
            successs: false,
            details: `The function "${functionName}" is not executed. You can contact GeoDa.AI team for assistance. The error message is: ${error}`
          };
        }

        // submit tool outputs
        if (openai && thread && curr_run && curr_run.status !== 'in_progress') {
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
          let lastMessage = '\n\n';
          responseStream
            .on('textDelta', (textDelta, snapshot) => {
              lastMessage = snapshot.value || '';
              streamMessageCallback(snapshot.value || '');
            })
            .on('end', async () => {
              if (error === null && output) {
                // append a custom response e.g. plot, map etc. if needed
                const lastCustomFunctionCall = {functionName, functionArgs: args, output};
                const customReponseMsg = customMessageCallback(lastCustomFunctionCall);
                if (customReponseMsg) {
                  streamMessageCallback(lastMessage, customReponseMsg);
                }
              } else {
                console.log('there is an error happend in the custom function');
              }
              // wait for the runs to complete
              if (curr_run?.status !== 'completed' && openai && thread) {
                try {
                  await openai.beta.threads.runs.cancel(thread.id, curr_run?.id || '');
                } catch (err) {
                  console.error(err);
                }
              }
            })
            .on('error', async err => {
              console.error(err);
              if (openai && thread && curr_run && curr_run.status !== 'completed') {
                await openai.beta.threads.runs.cancel(thread.id, curr_run?.id || '');
              }
            })
            .on('abort', async () => {
              console.log('abort');
              if (openai && thread && curr_run && curr_run.status !== 'completed') {
                await openai.beta.threads.runs.cancel(thread.id, curr_run?.id || '');
              }
            });
        }
        previousFunctionName = functionName;
      }
    });
  }
}
