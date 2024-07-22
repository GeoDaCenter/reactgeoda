import React, {useState, useEffect, useCallback} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
// import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {setScreenCaptured, setStartScreenCapture} from '@/actions';
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
  // update message callback function
  setMessages: (messages: MessageModel[]) => void;
  className?: string;
};

export const ChatGPTComponent = ({
  openAIKey,
  initOpenAI,
  processMessage,
  speechToText,
  messages,
  setMessages
}: ChatGPTComponentProps) => {
  // const intl = useIntl();
  const dispatch = useDispatch();

  const [isTyping, setIsTyping] = useState(false);
  // if in dashboard mode, the message should be draggable
  const isMessageDraggable = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  // use selector to get screenCaptured flag
  const screenCaptured = useSelector((state: GeoDaState) => state.root.uiState.screenCaptured);

  // handle send message
  const handleSend = useCallback(
    async (message: string) => {
      // display input message in dialog
      const newMessage: MessageModel = {
        message,
        direction: 'outgoing',
        sender: 'user',
        position: 'normal'
      };

      const newMessages: Array<MessageModel> = [...messages, newMessage];
      setMessages(newMessages);
      setIsTyping(true);

      // add an empty return message to show typing indicator
      setMessages([
        ...newMessages,
        {message: '', direction: 'incoming', sender: 'ChatGPT', position: 'normal'}
      ]);

      let screenshotImage: string | undefined = undefined;

      // prepare image message
      if (screenCaptured && screenCaptured.length > 0) {
        // get screenshot image from localStorage
        screenshotImage = screenCaptured || undefined;
        // dispatch action to set screenCaptured to empty
        dispatch(setScreenCaptured(''));
      }

      // process input message to chatgpt
      await processMessage(
        message,
        (deltaMessage: string, customMessage?: MessageModel, isCompleted?: boolean) => {
          if (deltaMessage.length > 0) {
            setIsTyping(false);
          }
          setMessages([
            ...newMessages,
            {message: deltaMessage, direction: 'incoming', sender: 'ChatGPT', position: 'normal'},
            ...(customMessage ? [customMessage] : [])
          ]);
          if (isCompleted) {
            localStorage.removeItem('screenshot');
          }
        },
        screenshotImage
      );
    },
    [dispatch, messages, processMessage, setMessages, screenCaptured]
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

  // replace the child element of div with className cs-button--attachment with a camera svg component in useEffect
  useEffect(() => {
    const element = document.querySelector('.cs-button--attachment');
    if (element) {
      // replace the element.innerHTML with a svg component that shows a picture canvas
      element.innerHTML = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 4.00033H10.4C8.15979 4.00033 7.03969 4.00033 6.18404 4.4363C5.43139 4.81979 4.81947 5.43172 4.43597 6.18436C4 7.04001 4 8.16012 4 10.4003V21.6003C4 23.8405 4 24.9606 4.43597 25.8163C4.81947 26.5689 5.43139 27.1809 6.18404 27.5644C7.03969 28.0003 8.15979 28.0003 10.4 28.0003H22.6667C23.9066 28.0003 24.5266 28.0003 25.0353 27.864C26.4156 27.4942 27.4938 26.416 27.8637 25.0356C28 24.5269 28 23.907 28 22.667M25.3333 10.667V2.66699M21.3333 6.66699H29.3333M14 11.3337C14 12.8064 12.8061 14.0003 11.3333 14.0003C9.86057 14.0003 8.66667 12.8064 8.66667 11.3337C8.66667 9.8609 9.86057 8.66699 11.3333 8.66699C12.8061 8.66699 14 9.8609 14 11.3337ZM19.9867 15.8912L8.7082 26.1444C8.07382 26.7211 7.75663 27.0095 7.72857 27.2593C7.70425 27.4758 7.78727 27.6905 7.95091 27.8344C8.13971 28.0003 8.56837 28.0003 9.42571 28.0003H21.9413C23.8602 28.0003 24.8196 28.0003 25.5732 27.678C26.5193 27.2733 27.2729 26.5196 27.6776 25.5736C28 24.82 28 23.8605 28 21.9416C28 21.296 28 20.9732 27.9294 20.6725C27.8407 20.2947 27.6706 19.9408 27.431 19.6355C27.2403 19.3926 26.9883 19.1909 26.4841 18.7876L22.7544 15.8039C22.2499 15.4002 21.9976 15.1984 21.7197 15.1271C21.4748 15.0644 21.2172 15.0725 20.9767 15.1506C20.7039 15.2392 20.4648 15.4565 19.9867 15.8912Z" stroke="#475467" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
  }, []);

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
    setMessages([
      ...messages.slice(0, messages.length - 1),
      {
        message: messages[messages.length - 1].message,
        direction: 'incoming',
        sender: 'Error',
        position: 'normal'
      }
    ]);
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
                    : 'https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png'
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
        />
        <p className="px-2 text-tiny text-default-400">
          GeoDa.AI can make mistakes. Consider checking information.
        </p>
      </div>
    </div>
  );
};
