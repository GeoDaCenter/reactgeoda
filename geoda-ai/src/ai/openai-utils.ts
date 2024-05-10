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

// key is the name of the function, value is the function itself
export type CustomFunctions = {
  [key: string]: (
    ...args: any[]
  ) =>
    | {result: string | Object; error?: string}
    | Promise<{result: string | Object; error?: string}>;
};

export type CustomFunctionCall = {
  functionName: string;
  functionArgs: {};
  output: any;
};

export type ProcessMessageProps = {
  question: string;
  customFunctions: CustomFunctions;
  customFunctionContext: any;
  customMessageCallback: (customFunctionCall: any) => MessageModel | null;
  streamMessageCallback: (deltaMessage: string, customMessage?: MessageModel) => void;
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
}: ProcessMessageProps): Promise<MessageModel[]> {
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
    .on('textCreated', text => {
      console.log('assistant >', text);
    })
    .on('textDelta', (textDelta, snapshot) => {
      streamMessageCallback(snapshot.value || '');
    })
    .on('toolCallCreated', toolCall => {
      console.log('toolCallCreated: ', toolCall);
    })
    .on('toolCallDelta', async toolCallDelta => {
      console.log('toolCallDelta: ', toolCallDelta);
    })
    .on('end', async () => {
      console.log('end event');
      if (openai && thread) {
        const runs = await openai.beta.threads.runs.list(thread.id);
        const curr_run = runs.data.find(run => run.status === 'requires_action');
        curr_run?.required_action?.submit_tool_outputs.tool_calls.forEach(async toolCall => {
          let result: string | Object = '';
          let output;
          const functionName = toolCall.function.name;
          const func = customFunctions[functionName];
          const args = JSON.parse(toolCall.function.arguments);
          try {
            output = await func(args, customFunctionContext);
            result = output.result;
          } catch (error) {
            console.error(error);
            result = `The function "${functionName}" is not defined. You can contact GeoDa.AI team for assistance. The error message is: ${error}`;
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
            const lastCustomFunctionCall = {functionName, functionArgs: args, output};
            let lastMessage = '';
            responseStream
              .on('textDelta', (textDelta, snapshot) => {
                lastMessage = snapshot.value || '';
                streamMessageCallback(snapshot.value || '');
              })
              .on('end', () => {
                // append a custom response e.g. plot, map etc.
                const customReponseMsg = customMessageCallback(lastCustomFunctionCall);
                if (customReponseMsg) {
                  streamMessageCallback(lastMessage, customReponseMsg);
                }
              });
          }
        });
      }
    });

  const result = await run.finalRun();
  console.log('Run Result' + result);

  // // create a run
  // const run = await openai.beta.threads.runs.create(thread.id, {
  //   assistant_id: assistant.id
  // });

  // // imediately fetch run-status, which will be "in_progress"
  // let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  // // record last custom function call
  // let lastCustomFunctionCall = null;

  // // polling mechanism to see if runStatus is completed
  // while (runStatus.status !== 'completed') {
  //   await new Promise(resolve => setTimeout(resolve, 1000));
  //   runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

  //   // Check for requires_action status
  //   if (runStatus.status === 'requires_action') {
  //     const toolCalls = runStatus.required_action?.submit_tool_outputs.tool_calls;
  //     const toolOutputs = [];

  //     for (let i = 0; toolCalls?.length && i < toolCalls.length; i++) {
  //       const toolCall = toolCalls[i];
  //       const functionName = toolCall.function.name;
  //       console.log(`This question requires us to call a function: ${functionName}`);

  //       const args = JSON.parse(toolCall.function.arguments);
  //       const argsArray = Object.keys(args).map(key => args[key]);
  //       console.log(`The arguments for this function are: ${argsArray} and ${args}`);

  //       // Dynamically call the function with arguments
  //       const func = customFunctions[functionName];
  //       let output = null;
  //       if (func) {
  //         // run the function locally and get the output
  //         output = await func(args, customFunctionContext);
  //         if (output.result) {
  //           toolOutputs.push({
  //             tool_call_id: toolCall.id,
  //             output: JSON.stringify(output.result)
  //           });
  //           lastCustomFunctionCall = {functionName, functionArgs: args, output};
  //         }
  //       }
  //       if (!func || !output?.result) {
  //         const errorMessage = `The function ${functionName} is not defined. You can contact GeoDa.AI team for assistance.`;
  //         console.error(errorMessage);
  //         // push an empty output
  //         toolOutputs.push({
  //           tool_call_id: toolCall.id,
  //           output: errorMessage
  //         });
  //       }
  //     }
  //     // submit tool outputs, which is part of the process of training and improving AI model
  //     await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
  //       tool_outputs: toolOutputs
  //     });
  //     continue; // Continue polling for the final response
  //   }
  //   // Check for failed, cancelled, or expired status
  //   if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
  //     console.log(`Run status is '${runStatus.status}'. Unable to complete the request.`);
  //     break; // Exit the loop if the status indicates a failure or cancellation
  //   }
  // }

  // // Get the last assistant message from the messages array
  // const messages = await openai.beta.threads.messages.list(thread.id);
  // // Find the last message for the current run
  // const lastMessageForRun = messages.data
  //   .filter(message => message.run_id === run.id && message.role === 'assistant')
  //   .pop();

  // // If an assistant message is found
  // if (lastMessageForRun) {
  //   if ('text' in lastMessageForRun.content[0]) {
  //     const messageContent = lastMessageForRun.content[0].text.value;
  //     console.log(`The assistant responded with: ${messageContent}`);
  //     const responseMsgs: MessageModel[] = [
  //       {
  //         message: messageContent,
  //         sender: 'ChatGPT',
  //         direction: 'incoming',
  //         position: 'normal'
  //       }
  //     ];
  //     // append a custom response e.g. plot, map etc.
  //     if (lastCustomFunctionCall) {
  //       const customReponseMsg = customMessageCallback(lastCustomFunctionCall);
  //       if (customReponseMsg) {
  //         responseMsgs.push(customReponseMsg);
  //       }
  //     }
  //     return responseMsgs;
  //   }
  // } else if (!['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
  //   console.log('No response received from the assistant.');
  // }
  return [];
}
