import OpenAI from 'openai';

import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {getTableSummary} from './use-duckdb';
import {CUSTOM_FUNCTIONS} from '@/utils/custom-functions';
import {GeoDaState} from '@/store';
import {useSelector} from 'react-redux';
import {MAP_ID} from '@/constants';
import {getDataContainer} from '@/utils/data-utils';

const ASSISTANT_ID = 'asst_nowaCi4DNY6SwLJIiLtDOuLG';

// declare global openai variable
let openai: OpenAI | null = null;
// global openai assistant
let assistant: OpenAI.Beta.Assistants.Assistant | null = null;
// global openai thread
let thread: OpenAI.Beta.Threads.Thread | null = null;

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
  output: any;
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

  if (functionName !== 'summarizeData') {
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
 * custom hook to use ChatGPT
 */
export function useChatGPT() {
  const tableName = useSelector((state: GeoDaState) => state.root.file.rawFileData.name);
  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState);
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  /**
   * Initialize ChatGPT assistant by passing the summary of the table from duckdb
   * @param apiKey
   */
  async function initOpenAI(apiKey: string) {
    if (!openai) {
      openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
      // retrive assistant
      assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID || '');
      // create a thread
      thread = await openai.beta.threads.create();
    }
  }

  /**
   * Upload sumary of the table to ChatGPT assistant
   * Note: this is not used specifically for uploading summary, but it could be a skeleton for uploading other file.
   * @param tableName table name
   */
  async function uploadSummary(tableName: string) {
    if (openai && assistant && tableName) {
      // create a file object to pass the summary of the table
      const tableSummary = await getTableSummary(tableName);
      // create a file object from the string
      const blob = new Blob([tableSummary], {
        type: 'text/plain;charset=utf-8'
      });
      const file = await openai.files.create({
        purpose: 'assistants',
        file: new File([blob], `data_summary_${tableName}.txt`)
      });
      // Retrieve existing file IDs
      const assistantDetails = await openai.beta.assistants.retrieve(assistant.id);
      let existingFileIds = assistantDetails.file_ids || [];
      console.log('existingFileIds', existingFileIds);

      // Update the assistant with the new file ID
      await openai.beta.assistants.update(assistant.id, {
        file_ids: [...existingFileIds, file.id]
      });
      // Update local assistantDetails and save to assistant.json
      assistantDetails.file_ids = [...existingFileIds, file.id];
      // remember file.id to be removed later
      const updatedAssistantDetails = await openai.beta.assistants.retrieve(assistant.id);
      const updatedExistingFileIds = updatedAssistantDetails.file_ids || [];
      console.log('updatedExistingFileIds', updatedExistingFileIds);
    }
  }

  /**
   * Process message by sending message to ChatGPT assistant and retrieving response
   * @returns
   */
  async function processMessage(question: string): Promise<MessageModel[] | null> {
    if (!openai || !thread || !assistant) return null;
    // pass in the user question into the existing thread
    await openai.beta.threads.messages.create(thread.id, {
      role: 'user',
      content: question
    });
    // create a run
    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: assistant.id
    });
    // imediately fetch run-status, which will be "in_progress"
    let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

    // record last custom function call
    let lastCustomFunctionCall = null;

    // polling mechanism to see if runStatus is completed
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      // Check for requires_action status
      if (runStatus.status === 'requires_action') {
        const toolCalls = runStatus.required_action?.submit_tool_outputs.tool_calls;
        const toolOutputs = [];

        for (let i = 0; toolCalls?.length && i < toolCalls.length; i++) {
          const toolCall = toolCalls[i];
          const functionName = toolCall.function.name;
          console.log(`This question requires us to call a function: ${functionName}`);

          const args = JSON.parse(toolCall.function.arguments);
          const argsArray = Object.keys(args).map(key => args[key]);
          console.log(`The arguments for this function are: ${argsArray} and ${args}`);

          // Dynamically call the function with arguments
          const func = CUSTOM_FUNCTIONS[functionName];
          let output = null;
          if (func) {
            // run the function locally and get the output
            output = await func(args, {tableName, visState, weights, dataContainer});
            if (output.result) {
              toolOutputs.push({
                tool_call_id: toolCall.id,
                output: JSON.stringify(output.result)
              });
              lastCustomFunctionCall = {functionName, functionArgs: args, output};
            }
          }
          if (!func || !output.result) {
            const errorMessage = `The function ${functionName} is not defined. You can contact GeoDa.AI team for assistance.`;
            console.error(errorMessage);
            // push an empty output
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: errorMessage
            });
          }
        }
        // submit tool outputs, which is part of the process of training and improving AI model
        await openai.beta.threads.runs.submitToolOutputs(thread.id, run.id, {
          tool_outputs: toolOutputs
        });
        continue; // Continue polling for the final response
      }
      // Check for failed, cancelled, or expired status
      if (['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
        console.log(`Run status is '${runStatus.status}'. Unable to complete the request.`);
        break; // Exit the loop if the status indicates a failure or cancellation
      }
    }
    // Get the last assistant message from the messages array
    const messages = await openai.beta.threads.messages.list(thread.id);
    // Find the last message for the current run
    const lastMessageForRun = messages.data
      .filter(message => message.run_id === run.id && message.role === 'assistant')
      .pop();

    // If an assistant message is found
    if (lastMessageForRun) {
      if ('text' in lastMessageForRun.content[0]) {
        const messageContent = lastMessageForRun.content[0].text.value;
        console.log(`The assistant responded with: ${messageContent}`);
        const responseMsgs: MessageModel[] = [
          {
            message: messageContent,
            sender: 'ChatGPT',
            direction: 'incoming',
            position: 'normal'
          }
        ];
        // append a custom response e.g. plot, map etc.
        if (lastCustomFunctionCall) {
          const customReponseMsg = createMessageFromCustomFunctionCall(lastCustomFunctionCall);
          if (customReponseMsg) {
            responseMsgs.push(customReponseMsg);
          }
        }
        return responseMsgs;
      }
    } else if (!['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
      console.log('No response received from the assistant.');
    }
    return null;
  }

  return {initOpenAI, processMessage, uploadSummary};
}
