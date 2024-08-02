import {AI_ACTIONS, DatasetMetaPayloadProps} from '@/actions';
import {MessageModel} from '@chatscope/chat-ui-kit-react';

export type AiStateProps = {
  messages: MessageModel[];
  datasetMeta?: DatasetMetaPayloadProps;
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
    default:
      return state;
  }
};
