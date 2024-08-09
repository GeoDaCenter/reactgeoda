import {
  CustomFunctionOutputProps,
  CustomFunctions,
  CustomMessageCallback,
  ProcessMessageProps,
  StreamMessageCallback
} from './types';

import OpenAI from 'openai';
import {Mutex} from 'async-mutex';

/** declare global openai variable */
let openai: OpenAI | null = null;

/** global openai assistant */
let assistant: OpenAI.Beta.Assistants.Assistant | undefined = undefined;

/** global openai thread */
let thread: OpenAI.Beta.Threads.Thread | null = null;

/** global locker for sending message */
const mutex = new Mutex();

/** global last message */
let lastMessage = '';

/**
 * Find if the assistant with name 'geoda.ai-openai-agent' exists
 */
export async function findAssistant(
  openai: OpenAI,
  assistantName: string
): Promise<OpenAI.Beta.Assistant | undefined> {
  const assistants = await openai.beta.assistants.list();
  return assistants.data.find(assistant => assistant.name === assistantName);
}

/**
 * Create a new GeoDa.AI assistant
 */
export async function createAssistant(
  openai: OpenAI,
  assistantContent: OpenAI.Beta.Assistants.AssistantCreateParams
): Promise<OpenAI.Beta.Assistant | undefined> {
  return await openai.beta.assistants.create(assistantContent);
}

/**
 * Test the openai connection
 */
export async function testOpenAIKey(apiKey: string): Promise<boolean> {
  const release = await mutex.acquire();

  const test = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
  let flag = true;
  try {
    await test.models.list();
  } catch (err) {
    console.error(err);
    flag = false;
  }

  release();
  return flag;
}

let openAIKey = '';
let openAIAssistantName = '';
let openAIAssistentBody: OpenAI.Beta.Assistants.AssistantCreateParams;
let openAIAssistantVersion: string | undefined = '';

/**
 * Initialize ChatGPT assistant by passing the summary of the table from duckdb
 * @param apiKey
 */
export async function initOpenAI(
  apiKey: string,
  assistantName: string,
  assistantContent: OpenAI.Beta.Assistants.AssistantCreateParams,
  currentVersion?: string
) {
  const release = await mutex.acquire();
  try {
    if (!openai) {
      openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
    }
    // find GeoDa.Ai assistant
    if (!assistant) {
      assistant = await findAssistant(openai, assistantName);
    }

    // create or update GeoDa.Ai assistant if needed
    if (!assistant) {
      // create a new assistant
      assistant = await createAssistant(openai, assistantContent);
    } else {
      // check if assistant is latest
      const assistantId = assistant.id;
      if (
        assistant.metadata &&
        typeof assistant.metadata === 'object' &&
        'version' in assistant.metadata
      ) {
        const version = assistant.metadata.version;
        if (currentVersion && version !== currentVersion) {
          // update assistant
          console.log('updating assistant');
          assistant = await openai.beta.assistants.update(assistantId, assistantContent);
        }
      }
    }
    if (!thread) {
      // create a thread
      thread = await openai.beta.threads.create();
    }
    // store the openai key, assistant name, assistant body and version
    openAIKey = apiKey;
    openAIAssistantName = assistantName;
    openAIAssistentBody = assistantContent;
    openAIAssistantVersion = currentVersion;
  } finally {
    // release the lock
    release();
  }
}

/**
 * Cancel the openai assistant run
 */
export async function cancelOpenAI() {
  const release = await mutex.acquire();
  try {
    if (openai && thread) {
      const runs = await openai.beta.threads.runs.list(thread.id);
      runs.data.forEach(async run => {
        if (openai && thread) {
          try {
            await openai.beta.threads.runs.cancel(thread.id, run.id);
          } catch (err) {
            // do nothing
          }
        }
      });
    }
  } finally {
    // release the lock
    release();
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
 * Set additional instructions for LLM. This is used to provide additional information to the assistant.
 * For example, one use case is to provide the metadata of the dataset when loading the dataset.
 *
 * @param message The message to be sent to the assistant
 */
export async function setAdditionalInstructions(message: string) {
  const release = await mutex.acquire();
  if (openai && thread && assistant) {
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: message + '\n Please do not respond to this message.'
    });

    const run = await openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistant.id
      })
      .on('end', async () => {
        release();
      })
      .on('error', async err => {
        console.error(err);
        run.abort();
        release();
      })
      .on('abort', async () => {
        console.error('abort');
        run.abort();
        release();
      });
    await run.finalMessages();
    await run.finalRun();
    console.log('additional instructions are set');
  }
}

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

  // create FsReadStream from the audioBlob
  const file = new File([audioBlob], 'audio.webm');

  let response = '';
  const release = await mutex.acquire();
  try {
    // create a translation from audio to text
    const translation = await openai.audio.translations.create({
      model: 'whisper-1',
      file: file
    });
    response = translation.text;
  } finally {
    // release the lock
    release();
  }

  return response;
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
  const release = await mutex.acquire();
  const imageMessageContent: OpenAI.Beta.Threads.ImageURLContentBlock = {
    type: 'image_url',
    image_url: {
      url: imageMessage || '',
      detail: 'high'
    }
  };
  lastMessage = '';
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
    })
    .on('end', async () => {
      release();
    })
    .on('error', async err => {
      console.error(err);
      release();
    })
    .on('abort', async () => {
      release();
    });
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
  if (!openai || !thread || !assistant) {
    // try to reinitialize the openai
    initOpenAI(openAIKey, openAIAssistantName, openAIAssistentBody, openAIAssistantVersion);
  }
  if (!openai || !thread || !assistant) {
    streamMessageCallback(
      'Sorry, Something went wrong, if the issue persists please contact us through our help center at https://github.com/orgs/geodaai/discussions/categories/bugs'
    );
    return;
  }

  // check active runs in the thread
  // wait until there is no active run, stop them
  const runs = await openai.beta.threads.runs.list(thread.id);
  if (runs.data.some(run => ['in_progress', 'queued', 'requires_action'].includes(run.status))) {
    console.log('The assistant is busy, try to cancel all runs.');
    await cancelOpenAI();
  }

  if (imageMessage) {
    // process image message
    return processImageMessage({imageMessage, textMessage, streamMessageCallback});
  }

  const release = await mutex.acquire();

  try {
    // create a message in the thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: textMessage
    });

    lastMessage = '';

    // create a run with stream to handle the assistant response
    const run = await openai.beta.threads.runs
      .stream(thread.id, {
        assistant_id: assistant.id,
        parallel_tool_calls: true
      })
      .on('toolCallCreated', async toolCall => {
        console.log('toolCallCreated', toolCall);
      });

    let nextRun = null;

    for await (const event of run) {
      // Retrieve events that are denoted with 'requires_action'
      // since these will have our tool_calls
      if (event.event === 'thread.run.requires_action') {
        nextRun = await handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
          customFunctions,
          customFunctionContext,
          customMessageCallback,
          streamMessageCallback
        );
      }
      if (event.event === 'thread.message.delta') {
        const content = event.data.delta.content;
        const textContent = content
          ?.filter(c => c.type === 'text')
          .reduce((acc, c) => {
            return acc + c.text?.value || '';
          }, '');

        lastMessage += textContent || '';
        // stream the message back to the UI
        streamMessageCallback(lastMessage);
      }
    }

    // if there is more than one function call in the same run, process them
    let previousFunctionName: string | null =
      nextRun?.run?.required_action?.submit_tool_outputs.tool_calls?.[0]?.function?.name || null;

    while (nextRun && nextRun.run?.status === 'requires_action') {
      nextRun = await handleRequiresAction(
        nextRun.run,
        nextRun.run.id,
        nextRun.run.thread_id,
        customFunctions,
        customFunctionContext,
        customMessageCallback,
        streamMessageCallback,
        nextRun.output
      );
      const nextFunctionName =
        nextRun?.run?.required_action?.submit_tool_outputs.tool_calls?.[0]?.function?.name || null;

      if (previousFunctionName === nextFunctionName) {
        await run.abort();
        break;
      }
    }

    // final run
    await run.finalRun();
  } finally {
    // release the lock
    release();
  }
}

async function handleRequiresAction(
  data: OpenAI.Beta.Threads.Run,
  runId: string,
  threadId: string,
  customFunctions: CustomFunctions,
  customFunctionContext: Object,
  customMessageCallback: CustomMessageCallback,
  streamMessageCallback: StreamMessageCallback,
  previousOutput?: CustomFunctionOutputProps<unknown, unknown>[]
) {
  try {
    const toolCalls = data.required_action?.submit_tool_outputs.tool_calls;
    if (!toolCalls) return null;

    const functionOutput: Array<CustomFunctionOutputProps<unknown, unknown>> = [];
    for (let i = 0; i < toolCalls?.length || 0; i++) {
      const toolCall = toolCalls[i];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);
      try {
        const func = customFunctions[functionName];
        const output = await func(
          functionName,
          functionArgs,
          customFunctionContext,
          previousOutput
        );
        functionOutput.push({
          ...output,
          name: functionName,
          args: functionArgs
        });
        // console.log('result to LLM:', output.result);
      } catch (err) {
        // make sure to return something back to openai when the function execution fails
        functionOutput.push({
          type: 'error',
          name: functionName,
          args: functionArgs,
          result: {
            success: false,
            details: `The function "${functionName}" is not executed. You can contact GeoDa.AI team for assistance. The error message is: ${err}`
          }
        });
      }
    }
    // Submit all the tool outputs at the same time
    const nextRun = await submitAllToolOutputs(
      runId,
      toolCalls[0].id,
      threadId,
      functionOutput,
      customMessageCallback,
      streamMessageCallback
    );

    return {run: nextRun, output: functionOutput};
  } catch (error) {
    console.error('Error processing required action:', error);
    return null;
  }
}

async function submitAllToolOutputs(
  runId: string,
  toolCallId: string,
  threadId: string,
  functionOutput: Array<CustomFunctionOutputProps<unknown, unknown>>,
  customMessageCallback: CustomMessageCallback,
  streamMessageCallback: StreamMessageCallback
) {
  if (lastMessage.length > 0) lastMessage += '\n\n';
  const toolOutputs = functionOutput.map(output => ({
    tool_call_id: toolCallId,
    output: JSON.stringify(output.result)
  }));

  // Use the submitToolOutputsStream helper
  const stream = openai?.beta.threads.runs
    .submitToolOutputsStream(threadId, runId, {
      tool_outputs: toolOutputs
    })
    .on('textDelta', textDelta => {
      // streaming what LLM responses and add a custom response UI if needed
      lastMessage = lastMessage + textDelta.value || '';
      streamMessageCallback(lastMessage);
    });

  const finalRun = await stream?.finalRun();

  // if finalRun still requires actions (function calls), we need to process them
  const isIntermediate = finalRun && finalRun.status === 'requires_action';

  // add custom response message in the UI
  if (!isIntermediate) {
    functionOutput.forEach(output => {
      const customResponseMsg = customMessageCallback({
        functionName: output.name,
        functionArgs: output.args,
        output
      });
      // append a custom response e.g. plot, map etc. if needed
      if (customResponseMsg && customResponseMsg.payload) {
        if (lastMessage.length > 0) lastMessage += '\n\n';
        streamMessageCallback(lastMessage, customResponseMsg.payload);
      }
    });
  }

  return finalRun;
}
