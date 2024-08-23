import {AI_ACTIONS, AIConfigProps, DatasetMetaPayloadProps} from '@/actions';
import {GUIDENCE_INSTRUCTIONS} from '@/ai/constants';
import {UserActionProps, MessageModel} from '@/ai/types';

export const DEFAULT_GUIDENCE_MESSAGES: UserActionProps[] = [
  {
    role: 'system',
    text: GUIDENCE_INSTRUCTIONS
  }
];

export type AiStateProps = {
  messages: MessageModel[];
  guidenceMessages?: UserActionProps[];
  datasetMeta?: DatasetMetaPayloadProps;
  config?: AIConfigProps;
};

const initialState: AiStateProps = {
  messages: [],
  guidenceMessages: DEFAULT_GUIDENCE_MESSAGES
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
    case AI_ACTIONS.SET_GUIDENCE_MESSAGES:
      return {
        ...state,
        guidenceMessages: action.payload
      };
    default:
      return state;
  }
};
