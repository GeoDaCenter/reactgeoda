import React, {useEffect, useCallback} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {useDispatch, useSelector} from 'react-redux';

import {MessageModel} from '@/ai/types';

import {GeoDaState} from '@/store';
import {
  sendMessageToAI,
  setDefaultPromptText,
  setIsPrompting,
  setMessages,
  setScreenCaptured,
  setStartScreenCapture
} from '@/actions';
import {cancelOpenAI} from '@/ai/openai-utils';
import PromptInputWithBottomActions from '../chat/prompt-input-with-bottom-actions';
import MessageCard from '../chat/message-card';
import {CUSTOM_FUNCTIONS} from '@/ai/assistant/custom-functions';
import {useChatGPT} from '@/hooks/use-chatgpt';
import {DuckDB} from '@/hooks/use-duckdb';
import {MAP_ID} from '@/constants';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

export type ChatGPTComponentProps = {
  // initial messages
  messages: Array<MessageModel>;
  className?: string;
};

export const ChatGPTComponent = ({messages}: ChatGPTComponentProps) => {
  // const intl = useIntl();
  const dispatch = useDispatch<any>();

  const isPrompting = useSelector((state: GeoDaState) => state.root.uiState.isPrompting);

  // if in dashboard mode, the message should be draggable
  const isMessageDraggable = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  // use selector to get screenCaptured flag
  const screenCaptured = useSelector((state: GeoDaState) => state.root.uiState.screenCaptured);

  // get default prompt text
  const defaultPromptText = useSelector(
    (state: GeoDaState) => state.root.uiState.defaultPromptText
  );

  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState);

  const weights = useSelector((state: GeoDaState) => state.root.weights);

  // useChatGPT hook
  const {speechToText} = useChatGPT({
    customFunctions: CUSTOM_FUNCTIONS,
    customFunctionContext: {
      visState,
      weights,
      queryValuesBySQL: DuckDB.getInstance().queryValuesBySQL
    }
  });

  // handle send message
  const handleSend = useCallback(
    (message: string) => {
      dispatch(sendMessageToAI(message));
    },
    [dispatch]
  );

  // scroll to bottom when new message is added
  useEffect(() => {
    // hack to scroll to bottom
    const element = document.getElementById('chat-message-list');
    if (element?.firstElementChild) {
      element.scrollTop = element.firstElementChild.scrollHeight + 100;
    }
  }, [messages]);

  // check if default prompt text is set, then send message
  useEffect(() => {
    if (defaultPromptText && defaultPromptText.length > 0) {
      handleSend(defaultPromptText);
      // reset default prompt text
      dispatch(setDefaultPromptText(''));
    }
  }, [defaultPromptText, dispatch, handleSend]);

  // handle on screenshot click
  const onScreenshotClick = useCallback(() => {
    // dispatch to set startScreenCapture to true
    dispatch(setStartScreenCapture(true));
  }, [dispatch]);

  const onRemoveScreenshot = useCallback(() => {
    dispatch(setScreenCaptured(''));
  }, [dispatch]);

  // handle stop running chat
  const stopRunningChat = () => {
    dispatch(setIsPrompting(false));
    // calll to stop openai runs
    cancelOpenAI();
    // set status of last message to failed
    dispatch(
      setMessages([
        ...messages.slice(0, messages.length - 1),
        {
          message: messages[messages.length - 1].message,
          direction: 'incoming',
          sender: 'Error',
          position: 'normal'
        }
      ])
    );
  };

  // handle report question
  const reportQuestion = useCallback(
    (messageIndex: number) => {
      // report the question
      // get the current question from the message by index
      const question = messages[messageIndex].message;
      // open this link in a new tab
      const url = `https://github.com/orgs/geodaai/discussions/new?category=bugs&title=[AI Assistant Issue]Your Title&body=[Your Report]%0A%0A>${question}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    [messages]
  );

  return (
    <div className="order-1 m-2 flex h-full flex-grow flex-col space-y-4 overflow-y-auto overflow-x-hidden">
      <div
        className="relative flex h-full flex-col gap-4 overflow-y-auto overflow-x-hidden px-1"
        id="chat-message-list"
      >
        <div className="overscroll-behavior-y-auto overflow-anchor-auto touch-action-none absolute bottom-0 left-0 right-0 top-0 flex h-full flex-col gap-4 px-1">
          {messages.map((message, i) => {
            const messageElement = message.message as string;
            return (
              <MessageCard
                key={i}
                index={i}
                avatar={
                  message.direction === 'incoming'
                    ? '/img/geoda-ai-chat.png'
                    : 'https://images.unsplash.com/broken'
                }
                currentAttempt={i === 1 ? 2 : 1}
                message={
                  messageElement.startsWith('data:image') ? (
                    <img src={messageElement} />
                  ) : (
                    messageElement
                  )
                }
                customMessage={message.payload}
                messageClassName={
                  message.sender === 'action'
                    ? 'border-yellow-600 border-medium'
                    : message.direction == 'outgoing'
                      ? 'bg-content3 text-content3-foreground'
                      : ''
                }
                showFeedback={message.direction === 'incoming'}
                status={
                  isPrompting && i === messages.length - 1
                    ? 'pending'
                    : message.sender === 'Error'
                      ? 'failed'
                      : 'success'
                }
                stopChat={stopRunningChat}
                onFeedback={reportQuestion}
                draggable={isMessageDraggable}
                unselectable="on"
                onDragStart={e =>
                  e.dataTransfer.setData(
                    'text/plain',
                    JSON.stringify({
                      id: `message-${i}`,
                      type: 'text',
                      message: message.message || ''
                    })
                  )
                }
              />
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <PromptInputWithBottomActions
          onSendMessage={handleSend}
          onScreenshotClick={onScreenshotClick}
          onRemoveScreenshot={onRemoveScreenshot}
          screenCaptured={screenCaptured}
          onVoiceMessage={speechToText}
          defaultPromptText={defaultPromptText}
        />
        <p className="px-2 text-tiny text-default-400">
          GeoDa.AI can make mistakes. Consider checking information.
        </p>
      </div>
    </div>
  );
};
