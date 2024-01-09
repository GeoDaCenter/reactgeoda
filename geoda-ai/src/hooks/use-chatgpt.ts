import OpenAI from 'openai';

import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {getTableNameSync, getTableSummary} from './use-duckdb';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const ASSISTANT_ID = 'asst_nowaCi4DNY6SwLJIiLtDOuLG';

// declare global openai variable
let openai: OpenAI | null = null;
// global openai assistant
let assistant: OpenAI.Beta.Assistants.Assistant | null = null;
// global openai thread
let thread: OpenAI.Beta.Threads.Thread | null = null;

// define a type of custom function that is an object contains key-value pairs
// key is the name of the function, value is the function itself
type CustomFunctions = {
  [key: string]: (...args: any[]) => any;
};

const CUSTOM_FUNCTIONS: CustomFunctions = {
  localMoran: function (varName: string) {
    // dispatch local moran action
    console.log('calling localMoran() with arguments:', varName);
    return 'local moran';
  },
  summarizeData: function (tableName?: string) {
    // dispatch summarize data action
    console.log('calling summarizeData() with arguments:', tableName);
    return getTableNameSync();
  }
};

const systemMessage = {
  role: 'system',
  content:
    "Explain things like you're talking to a software professional with 2 years of experience."
};

/**
 * custom hook to use ChatGPT
 */
export function useChatGPT() {
  /**
   * Initialize ChatGPT assistant by passing the summary of the table from duckdb
   * @param apiKey
   */
  async function initOpenAI(apiKey: string, tableName: string | undefined) {
    if (!openai && tableName) {
      openai = new OpenAI({apiKey, dangerouslyAllowBrowser: true});
      // retrive assistant
      assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID || '');
      // create a thread
      thread = await openai.beta.threads.create();
    }
  }

  /**
   * Upload sumary of the table to ChatGPT assistant 
   * @param tableName 
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
  async function processMessage(question: string): Promise<MessageModel | null> {
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
          if (func) {
            // run the function locally and get the output
            const output = func(args);
            toolOutputs.push({
              tool_call_id: toolCall.id,
              output: output
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

    // If an assistant message is found, console.log() it
    if (lastMessageForRun) {
      const messageContent = lastMessageForRun.content[0].text.value;
      console.log(`The assistant responded with: ${messageContent}`);
      return {
        message: messageContent,
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'normal'
      };
    } else if (!['failed', 'cancelled', 'expired'].includes(runStatus.status)) {
      console.log('No response received from the assistant.');
    }
    return null;
  }

  async function processMessageWithFetch(
    chatMessages: Array<MessageModel>,
    data: any
  ): Promise<MessageModel | null> {
    let apiMessages = chatMessages.map(messageObject => {
      let role = messageObject.sender === 'ChatGPT' ? 'assistant' : 'user';
      return {role: role, content: messageObject.message};
    });

    let dataContent = typeof data === 'string' ? data : JSON.stringify(data);

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        {role: 'system', content: dataContent}, // passing data
        ...apiMessages
      ]
    };

    const returnMessage = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    });

    const returnMessageJson = await returnMessage.json();
    console.log(returnMessageJson);

    if (returnMessageJson && returnMessageJson.choices && returnMessageJson.choices.length > 0) {
      return {
        message: returnMessageJson.choices[0].message.content,
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'normal'
      };
    }
    console.error('The data.choices is undefined or empty.');
    return null;
  }

  return {initOpenAI, processMessageWithFetch, processMessage};
}
