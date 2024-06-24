import {MessageModel} from '@chatscope/chat-ui-kit-react';
// import {getTableSummary} from './use-duckdb';
import {CUSTOM_FUNCTIONS} from '@/ai/assistant/custom-functions';
import {GeoDaState} from '@/store';
import {useSelector} from 'react-redux';
import {MAP_ID} from '@/constants';
import {getDataContainer} from '@/utils/data-utils';
import {CustomFunctionOutputProps, initOpenAI, processMessage} from '@/ai/openai-utils';
import {useDuckDB} from './use-duckdb';

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
 * custom hook to use ChatGPT
 */
export function useChatGPT() {
  const tableName = useSelector((state: GeoDaState) => state.root.file.rawFileData?.fileName);
  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState);
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  // use selector to get dataContainer
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  const {queryValues} = useDuckDB();

  /**
   * Upload sumary of the table to ChatGPT assistant
   * Note: this is not used specifically for uploading summary, but it could be a skeleton for uploading other file.
   * @param tableName table name
   */
  // async function uploadSummary(tableName: string) {
  //   if (openai && assistant && tableName) {
  //     // create a file object to pass the summary of the table
  //     const tableSummary = await getTableSummary(tableName);
  //     // create a file object from the string
  //     const blob = new Blob([tableSummary], {
  //       type: 'text/plain;charset=utf-8'
  //     });
  //     const file = await openai.files.create({
  //       purpose: 'assistants',
  //       file: new File([blob], `data_summary_${tableName}.txt`)
  //     });
  //     // Retrieve existing file IDs
  //     const assistantDetails = await openai.beta.assistants.retrieve(assistant.id);
  //     let existingFileIds = assistantDetails.file_ids || [];
  //     console.log('existingFileIds', existingFileIds);

  //     // Update the assistant with the new file ID
  //     await openai.beta.assistants.update(assistant.id, {
  //       file_ids: [...existingFileIds, file.id]
  //     });
  //     // Update local assistantDetails and save to assistant.json
  //     assistantDetails.file_ids = [...existingFileIds, file.id];
  //     // remember file.id to be removed later
  //     const updatedAssistantDetails = await openai.beta.assistants.retrieve(assistant.id);
  //     const updatedExistingFileIds = updatedAssistantDetails.file_ids || [];
  //     console.log('updatedExistingFileIds', updatedExistingFileIds);
  //   }
  // }

  /**
   * Process message by sending message to ChatGPT assistant and retrieving response
   * @returns
   */
  async function processChatGPTMessage(
    question: string,
    streamMessage: (delta: string, customMessage?: MessageModel) => void,
    imageMessage?: string
  ) {
    await processMessage({
      question,
      imageMessage,
      customFunctions: CUSTOM_FUNCTIONS,
      customFunctionContext: {tableName, visState, weights, dataContainer, queryValues},
      customMessageCallback: createMessageFromCustomFunctionCall,
      streamMessageCallback: streamMessage
    });
  }

  return {initOpenAI, processChatGPTMessage};
}
