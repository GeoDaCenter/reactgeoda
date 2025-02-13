import {
  getMetaDataCallback,
  MetaDataCallbackOutput
} from '@/ai/assistant/callbacks/callback-metadata';
import {ErrorOutput} from '@/ai/assistant/custom-functions';
import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';
import {MessageModel, UserActionProps} from '@openassistant/core';
import {Dispatch, UnknownAction} from 'redux';

export enum AI_ACTIONS {
  SET_MESSAGES = 'SET_MESSAGES',
  SET_DATASET_META = 'SET_DATASET_META',
  ADD_DATASET_META = 'ADD_DATASET_META',
  SET_CONFIG = 'SET_CONFIG',
  SET_GUIDENCE_MESSAGES = 'SET_USER_ACTIONS'
}

export const setMessages = (payload: MessageModel[]) => ({
  type: AI_ACTIONS.SET_MESSAGES,
  payload
});

export const setGuidanceMessages = (payload: UserActionProps[]) => ({
  type: AI_ACTIONS.SET_GUIDENCE_MESSAGES,
  payload
});

export type DatasetMetaProps = {
  datasetId: string;
  datasetName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columnNames: string[];
  columnDataTypes: string[];
};

export type AIConfigProps = {
  provider?: string;
  model?: string;
  apiKey?: string;
  temperature?: number;
  topP?: number;
  baseUrl?: string;
};

export type DatasetMetaPayloadProps = Array<DatasetMetaProps>;

export const setDatasetMeta = (payload: DatasetMetaPayloadProps) => ({
  type: AI_ACTIONS.SET_DATASET_META,
  payload
});

export const addDatasetMeta = (payload: DatasetMetaProps) => ({
  type: AI_ACTIONS.ADD_DATASET_META,
  payload
});

export const setAIConfig = (payload: AIConfigProps) => ({
  type: AI_ACTIONS.SET_CONFIG,
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
          // const textDatasetMeta = JSON.stringify(newMetaData);
          // const message = `Please use the metadata of the following datasets to help users applying spatial data analysis: ${textDatasetMeta}. Please try to correct the variable names if they are not correct.`;

          // // add dataset metadata as additional instructions for AI model
          // await initOpenAI(
          //   openAIKey,
          //   GEODA_AI_ASSISTANT_NAME,
          //   GEODA_AI_ASSISTANT_BODY,
          //   GEODA_AI_ASSISTANT_VERSION
          // );
          // await setAdditionalInstructions(message);

          // update datasetMeta in the store
          dispatch(addDatasetMeta(newMetaData.result as unknown as DatasetMetaProps));
        }
      }
    }
  };
