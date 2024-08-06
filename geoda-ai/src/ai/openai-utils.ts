import OpenAI from 'openai';
import {ReactNode} from 'react';
import {GEODA_AI_ASSISTANT_BODY, GEODA_AI_ASSISTANT_VERSION} from './assistant/geoda-assistant';
import {isCustomMessagePayload, isValidCustomMessage} from '@/components/chatgpt/custom-messages';

export interface MessageImageContentProps {
  src?: string;
  width?: string | number;
  height?: string | number;
  alt?: string;
}
export type MessageDirection = 'incoming' | 'outgoing' | 0 | 1;
export type MessageType = 'html' | 'text' | 'image' | 'custom';
export type MessagePayload = string | Record<string, any> | MessageImageContentProps | ReactNode;

/**
 * Type of MessageModel
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

/** declare global openai variable */
let openai: OpenAI | null = null;

/** global openai assistant */
let assistant: OpenAI.Beta.Assistants.Assistant | undefined = undefined;

/** global openai thread */
let thread: OpenAI.Beta.Threads.Thread | null = null;

/** global locker for sending message */
let isLocked = false;

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
 * Test the openai connection
 */
export async function testOpenAIKey(apiKey: string): Promise<boolean> {
  const test = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
  try {
    await test.models.list();
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
}

/**
 * Initialize ChatGPT assistant by passing the summary of the table from duckdb
 * @param apiKey
 */
export async function initOpenAI(apiKey: string) {
  if (!openai) {
    openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
  }
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
  if (!thread) {
    // create a thread
    thread = await openai.beta.threads.create();
  }
}

/**
 * Cancel the openai assistant run
 */
export async function cancelOpenAI() {
  isLocked = false;
  if (openai && thread) {
    const runs = await openai.beta.threads.runs.list(thread.id);
    runs.data.forEach(async run => {
      if (openai && thread && run.status !== 'completed') {
        await openai.beta.threads.runs.cancel(thread.id, run.id);
      }
    });
  }
}

/**
 * Close the openai assistant
 */
export async function closeOpenAI() {
  isLocked = false;
  if (openai && thread) {
    await cancelOpenAI();
    await openai.beta.threads.del(thread.id);
  }
  assistant = undefined;
  thread = null;
}

/**
 * Set additional instructions for LLM. This is used to provide additional information to the assistant.
 * For example, one use case is to provide the metadata of the dataset when loading the dataset.
 *
 * @param message The message to be sent to the assistant
 */
export async function setAdditionalInstructions(message: string) {
  // check if the function is already running
  while (isLocked) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
  }

  // lock the function
  isLocked = true;

  if (openai && thread && assistant) {
    // check active runs in the thread
    const runs = await openai.beta.threads.runs.list(thread.id);

    // wait until there is no active run
    while (runs.data.some(run => run.status === 'in_progress' || run.status === 'queued')) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message
    });
    await openai.beta.threads.messages.create(thread.id, {
      role: 'assistant',
      content: 'Please do not respond to this message.'
    });
    const run = await openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistant.id
      })
      .on('end', async () => {
        isLocked = false;
      })
      .on('error', async err => {
        console.error(err);
        cancelOpenAI();
      })
      .on('abort', async () => {
        console.error('abort');
        cancelOpenAI();
      });
    run.finalRun();
    console.log('additional instructions are set');
  }
}

/**
 * Type of Custom function output props
 */
export type CustomFunctionOutputProps<R, D> = {
  /** the type of the function, e.g. plot, map, table etc. */
  type: string;
  // the name of the function, e.g. createMap, createPlot etc.
  name: string;
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
    ...args: any[]
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
  functionArgs: {};
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
 * Type of StreamMessageCallback
 *
 * @param deltaMessage The delta message from the assistant
 * @param customMessage The custom message from the custom function
 * @param isCompleted The flag to indicate if the message is completed
 */
export type StreamMessageCallback = (
  deltaMessage: string,
  customMessage?: MessageModel,
  isCompleted?: boolean
) => void;

/**
 * Context objects for custom functions
 */
export type CustomFunctionContext = {
  [key: string]: any;
};

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

/**
 * Translate voice to text using whisper-1 model
 *
 * @param audioBlob The audio blob to be translated to text
 * @returns The translated text
 */
export async function translateVoiceToText(audioBlob: Blob): Promise<string> {
  if (!openai || !thread || !assistant) {
    return 'Sorry, I cannot process the audio at the moment. Connection to the server is lost.';
  }

  // check if the function is already running
  while (isLocked) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
  }

  // lock the function
  isLocked = true;

  // create FsReadStream from the audioBlob
  const file = new File([audioBlob], 'audio.webm');

  // create a translation from audio to text
  const translation = await openai.audio.translations.create({
    model: 'whisper-1',
    file: file
  });

  // return the translated text
  const response = translation.text;

  // release the lock
  isLocked = false;

  return response;
}

/**
 * Process message by sending message to LLM assistant and retrieving response
 *
 * @returns None
 */
export async function processMessage({
  textMessage,
  imageMessage,
  customFunctions,
  customFunctionContext,
  customMessageCallback,
  streamMessageCallback
}: ProcessMessageProps) {
  if (!openai || !thread || !assistant) return;

  // check active runs in the thread
  // const runs = await openai.beta.threads.runs.list(thread.id);

  // wait until there is no active run, the max wait time is 20 seconds
  // const currentTime = new Date().getTime();
  // while (runs.data.some(run => run.status === 'in_progress' || run.status === 'queued')) {
  //   await new Promise(resolve => setTimeout(resolve, 100));
  //   const timeDiff = new Date().getTime() - currentTime;
  //   if (timeDiff > 20000) {
  //     console.error('The assistant is busy, try to cancel all runs.');
  //     await cancelOpenAI();
  //     break;
  //   }
  // }

  if (imageMessage) {
    // process image message
    return processImageMessage({imageMessage, textMessage, streamMessageCallback});
  }

  // check if the function is already running
  while (isLocked) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before checking again
  }

  // lock the function
  isLocked = true;

  // create a message in the thread
  await openai.beta.threads.messages.create(thread.id, {
    role: 'user',
    content: textMessage
  });

  let lastMessage = '';
  // create a run with stream to handle the assistant response
  const run = await openai.beta.threads.runs
    .stream(thread.id, {
      assistant_id: assistant.id
    })
    .on('textDelta', (textDelta, snapshot) => {
      // stream the message back to the UI
      streamMessageCallback(snapshot.value || '');
      lastMessage = snapshot.value || '';
    })
    .on('end', async () => {
      // process the requires action, e.g. custom functions
      await processRequiresAction(
        lastMessage,
        customFunctions,
        customFunctionContext,
        customMessageCallback,
        streamMessageCallback
      );

      // release the lock
      isLocked = false;
    });

  // final run
  run.finalRun();
}

/**
 * Type of ProcessImageMessageProps
 *
 * @param imageMessage The image message to be processed
 * @param textMessage The text message to be processed
 * @param streamMessageCallback The stream message callback to stream the message back to the UI
 */
type ProcessImageMessageProps = {
  imageMessage: string;
  textMessage: string;
  streamMessageCallback: StreamMessageCallback;
};

/**
 * Process the image message
 */
async function processImageMessage({
  imageMessage,
  textMessage,
  streamMessageCallback
}: ProcessImageMessageProps) {
  const imageMessageContent: OpenAI.Beta.Threads.ImageURLContentBlock = {
    type: 'image_url',
    image_url: {
      url: imageMessage || '',
      detail: 'high'
    }
  };
  let lastMessage = '';
  // request chat completion
  await openai?.beta.chat.completions
    .stream({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: textMessage
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
}

/**
 * Process the requires action from the openai assistant
 *
 * @param lastMessage The last message from the assistant
 * @param customFunctions The custom functions defined by users
 * @param customFunctionContext  The context object for the custom functions
 * @param customMessageCallback The custom message callback for the custom functions to create custom message e.g. map, plot etc.
 * @param streamMessageCallback  The stream message callback to stream the message back to the UI
 */
async function processRequiresAction(
  lastMessage: string,
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
      let resultToLLM: unknown | null = null;
      let functionOutput: CustomFunctionOutputProps<unknown, unknown> | null = null;
      // run custom function
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      // prevent running the same function (with different arguments) multiple times
      if (previousFunctionName !== functionName) {
        let isFunctionRunError = false;
        try {
          const func = customFunctions[functionName];
          functionOutput = await func(functionName, functionArgs, customFunctionContext);
          resultToLLM = functionOutput.result;
        } catch (err) {
          isFunctionRunError = true;
          // make sure to return something back to openai when the function execution fails
          resultToLLM = {
            error: true,
            details: `The function "${functionName}" is not executed. You can contact GeoDa.AI team for assistance. The error message is: ${err}`
          };
          functionOutput = {
            type: 'error',
            name: functionName,
            result: err
          };
        }

        const customReponseMsg = customMessageCallback({
          functionName,
          functionArgs,
          output: functionOutput
        });

        // submit tool outputs
        if (openai && thread && curr_run && curr_run.status !== 'in_progress' && resultToLLM) {
          submitToolOutputs({
            run: curr_run,
            toolCall,
            resultToLLM,
            isFunctionRunError,
            lastMessage,
            customReponseMsg,
            streamMessageCallback
          });
        }
        previousFunctionName = functionName;
      }
    });
  }
}

type SubmitToolOutputsProps = {
  run: OpenAI.Beta.Threads.Run;
  toolCall: OpenAI.Beta.Threads.RequiredActionFunctionToolCall;
  resultToLLM: Object;
  isFunctionRunError: boolean;
  lastMessage: string;
  customReponseMsg: MessageModel | null;
  streamMessageCallback: StreamMessageCallback;
};

function submitToolOutputs({
  run,
  toolCall,
  resultToLLM,
  isFunctionRunError,
  lastMessage,
  customReponseMsg,
  streamMessageCallback
}: SubmitToolOutputsProps) {
  if (!openai || !thread || !run) return;

  // send the result from the custom function back to LLM
  const responseStream = openai?.beta.threads.runs.submitToolOutputsStream(thread.id, run.id, {
    tool_outputs: [
      {
        tool_call_id: toolCall.id,
        output: JSON.stringify(resultToLLM)
      }
    ]
  });

  // streaming what LLM responses and add a custom response UI if needed
  responseStream
    .on('textDelta', textDelta => {
      lastMessage = lastMessage + textDelta.value || '';
      streamMessageCallback(lastMessage);
    })
    .on('end', async () => {
      if (!isFunctionRunError) {
        // append a custom response e.g. plot, map etc. if needed
        if (customReponseMsg && customReponseMsg.payload) {
          if (lastMessage.length === 0) lastMessage = '\n';
          // check if custom message is valid before rendering
          if (
            isCustomMessagePayload(customReponseMsg.payload) &&
            isValidCustomMessage(customReponseMsg.payload)
          ) {
            streamMessageCallback(lastMessage, customReponseMsg);
          }
        }
      } else {
        console.error('there is an error happend in the custom function');
      }
    })
    .on('error', async err => {
      console.error(err);
      cancelOpenAI();
    })
    .on('abort', async () => {
      console.log('abort');
      cancelOpenAI();
    });
}
