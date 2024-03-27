import {MessageModel} from '@chatscope/chat-ui-kit-react';

export enum AI_ACTIONS {
  SET_MESSAGES = 'SET_MESSAGES'
}

export const setMessages = (payload: MessageModel[]) => ({
  type: AI_ACTIONS.SET_MESSAGES,
  payload
});
