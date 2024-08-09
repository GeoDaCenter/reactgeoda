import {AI_ACTIONS, AIConfigProps, DatasetMetaPayloadProps} from '@/actions';
import {MessageModel} from '@chatscope/chat-ui-kit-react';

export type AiStateProps = {
  messages: MessageModel[];
  datasetMeta?: DatasetMetaPayloadProps;
  config?: AIConfigProps;
};

const initialState: AiStateProps = {
  messages: []
};

export type AiAction = {
  type: string;
  payload: MessageModel[] | DatasetMetaPayloadProps;
};

export const aiReducer = (state = initialState, action: AiAction) => {
  switch (action.type) {
    case AI_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    case AI_ACTIONS.SET_DATASET_META:
      return {
        ...state,
        datasetMeta: action.payload
      };
    case AI_ACTIONS.ADD_DATASET_META:
      return {
        ...state,
        datasetMeta: state.datasetMeta ? [...state.datasetMeta, action.payload] : [action.payload]
      };
    case AI_ACTIONS.SET_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      };
    default:
      return state;
  }
};
