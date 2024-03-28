import {AI_ACTIONS} from '@/actions';
import {MessageModel} from '@chatscope/chat-ui-kit-react';

export type AiStateProps = {
  messages: MessageModel[];
};

const initialState: AiStateProps = {
  messages: []
};

export type AiAction = {
  type: string;
  payload: MessageModel[];
};

export const aiReducer = (state = initialState, action: AiAction) => {
  switch (action.type) {
    case AI_ACTIONS.SET_MESSAGES:
      return {
        ...state,
        messages: action.payload
      };
    default:
      return state;
  }
};
