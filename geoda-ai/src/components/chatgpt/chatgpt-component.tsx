import React, {useState, useEffect, useCallback} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
// import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {
  setDefaultPromptText,
  setMessages,
  setScreenCaptured,
  setStartScreenCapture
} from '@/actions';
import {cancelOpenAI} from '@/ai/openai-utils';
import PromptInputWithBottomActions from '../chat/prompt-input-with-bottom-actions';
import MessageCard from '../chat/message-card';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

export type ChatGPTComponentProps = {
  openAIKey: string;
  // the function to initialize OpenAI js client
  initOpenAI: (apiKey: string) => void;
  // the function to process user prompt message and return response in array of MessageModel
  processMessage: (
    message: string,
    streamMessage: (delta: string, customMessage?: MessageModel) => void,
    imageMessage?: string
  ) => void;
  // the function
  speechToText: (voice: Blob) => Promise<string>;
  // initial messages
  messages: Array<MessageModel>;
  className?: string;
};

export const ChatGPTComponent = ({
  openAIKey,
  initOpenAI,
  processMessage,
  speechToText,
  messages
}: ChatGPTComponentProps) => {
  // const intl = useIntl();
  const dispatch = useDispatch();

  const [isTyping, setIsTyping] = useState(false);

  // if in dashboard mode, the message should be draggable
  const isMessageDraggable = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  // use selector to get screenCaptured flag
  const screenCaptured = useSelector((state: GeoDaState) => state.root.uiState.screenCaptured);

  // get default prompt text
  const defaultPromptText = useSelector(
    (state: GeoDaState) => state.root.uiState.defaultPromptText
  );

  // handle send message
  const handleSend = useCallback(
    async (message: string) => {
      // add user input message
      const newMessage: MessageModel = {
        message,
        direction: 'outgoing',
        sender: 'user',
        position: 'normal'
      };

      const newMessages: Array<MessageModel> = [...messages, newMessage];
      dispatch(setMessages(newMessages));
      setIsTyping(true);

      // add an empty return message to show typing indicator for chatbot
      dispatch(
        setMessages([
          ...newMessages,
          {message: '', direction: 'incoming', sender: 'ChatGPT', position: 'normal'}
        ])
      );

      let screenshotImage: string | undefined = undefined;

      // prepare image message if screenCaptured is set
      if (screenCaptured && screenCaptured.length > 0) {
        // get screenshot image from localStorage
        screenshotImage = screenCaptured || undefined;
        // dispatch action to set screenCaptured to empty
        dispatch(setScreenCaptured(''));
      }

      // send user message to chatbot
      await processMessage(
        message,
        (deltaMessage: string, customMessage?: MessageModel, isCompleted?: boolean) => {
          if (deltaMessage.length > 0) {
            setIsTyping(false);
          }
          dispatch(
            setMessages([
              ...newMessages,
              {message: deltaMessage, direction: 'incoming', sender: 'ChatGPT', position: 'normal'},
              ...(customMessage ? [customMessage] : [])
            ])
          );
          if (isCompleted) {
            localStorage.removeItem('screenshot');
          }
        },
        screenshotImage
      );

      // if last message is not a custom message and is empty, remove it
      if (newMessages.length > 0 && newMessages[newMessages.length - 1].message === '') {
        newMessages.pop();
      }
    },
    [dispatch, messages, processMessage, screenCaptured]
  );

  // initialize OpenAI client
  useEffect(() => {
    // set initial message
    // setMessages([
    //   // test any custom message
    //   {
    //     type: 'custom',
    //     message: '',
    //     sender: 'ChatGPT',
    //     direction: 'incoming',
    //     position: 'normal',
    //     payload: {
    //       type: 'custom',
    //       functionName: CustomFunctionNames.QUANTILE_BREAKS,
    //       functionArgs: {
    //         variable: 'HR60',
    //         k: 5
    //       },
    //       output: {
    //         quantile_breaks: [0.1, 0.2, 0.3, 0.4, 0.5]
    //       }
    //     }
    //   }
    // ]);
    if (openAIKey) {
      initOpenAI(openAIKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // handle stop running chat
  const stopRunningChat = () => {
    setIsTyping(false);
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
                message={message.message}
                customMessage={message.payload}
                messageClassName={
                  message.direction == 'outgoing' ? 'bg-content3 text-content3-foreground' : ''
                }
                showFeedback={message.direction === 'incoming'}
                status={
                  isTyping && i === messages.length - 1
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
