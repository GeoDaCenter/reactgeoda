import {
  getMetaDataCallback,
  MetaDataCallbackOutput
} from '@/ai/assistant/callbacks/callback-metadata';
import {GEODA_AI_ASSISTANT_BODY, GEODA_AI_ASSISTANT_VERSION} from '@/ai/assistant/geoda-assistant';
import {ErrorOutput} from '@/ai/assistant/custom-functions';
import {initOpenAI, setAdditionalInstructions} from '@/ai/openai-utils';
import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {Dispatch, UnknownAction} from 'redux';

export enum AI_ACTIONS {
  SET_MESSAGES = 'SET_MESSAGES',
  SET_DATASET_META = 'SET_DATASET_META'
}

export const setMessages = (payload: MessageModel[]) => ({
  type: AI_ACTIONS.SET_MESSAGES,
  payload
});

export type DatasetMetaPayloadProps = Array<{
  datasetId: string;
  datasetName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columnNames: string[];
  columnDataTypes: string[];
}>;

export const setDatasetMeta = (payload: DatasetMetaPayloadProps) => ({
  type: AI_ACTIONS.SET_DATASET_META,
  payload
});

// thunk action creators
export const addDatasetToAI =
  (datasetId: string, datasetName: string) =>
  async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    const geodaState = getState();
    const visState = geodaState.keplerGl[MAP_ID].visState;
    const datasetMeta = geodaState.root.ai.datasetMeta;
    const openAIKey = geodaState.root.uiState.openAIKey;

    if (openAIKey) {
      // check if datasetId alreay in datasetMeta, if not combine the new meta data with the existing one
      const datasetProcessed = datasetMeta?.find(meta => meta.datasetId === datasetId);

      if (!datasetProcessed) {
        // get meta data of the dataset
        const newMetaData: MetaDataCallbackOutput | ErrorOutput = getMetaDataCallback(
          {datasetName, datasetId},
          {tableName: datasetName, visState}
        );

        if (newMetaData.type === 'metadata') {
          const updatedDatasetMeta: DatasetMetaPayloadProps = [
            ...(datasetMeta || []),
            newMetaData.result
          ];
          const textDatasetMeta = JSON.stringify(newMetaData);
          const message = `Please use the metadata of the following datasets to help users applying spatial data analysis: ${textDatasetMeta}. Please try to correct the variable names if they are not correct.`;

          // update datasetMeta in the store
          dispatch(setDatasetMeta(updatedDatasetMeta));

          // add dataset metadata as additional instructions for AI model
          await initOpenAI(openAIKey, GEODA_AI_ASSISTANT_BODY, GEODA_AI_ASSISTANT_VERSION);
          await setAdditionalInstructions(message);
        }
      }
    }
  };
