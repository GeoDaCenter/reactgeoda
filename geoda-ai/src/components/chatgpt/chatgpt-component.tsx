import React, {useState, useEffect, MouseEvent} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import {useIntl} from 'react-intl';

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
  // the function to return a component to render custom message
  getCustomMessageComponent?: () => React.FC<{props: any}>;
  // initial messages
  messages: Array<MessageModel>;
  // update message callback function
  setMessages: (messages: MessageModel[]) => void;
  onStartCapture: () => null;
  screenshot?: string;
};

export const ChatGPTComponent = ({
  openAIKey,
  initOpenAI,
  processMessage,
  getCustomMessageComponent,
  messages,
  setMessages,
  onStartCapture,
  screenshot
}: ChatGPTComponentProps) => {
  const intl = useIntl();

  const CustomMessageComponent = getCustomMessageComponent && getCustomMessageComponent();

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

  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (message: string) => {
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
    if (localStorage.getItem('screenshot')) {
      // get screenshot image from localStorage
      screenshotImage = localStorage.getItem('screenshot') || undefined;
      // remove screenshot from localStorage
      localStorage.removeItem('screenshot');
      // remove element with id "screenshot-image"
      const screenshotDiv = document.getElementById('screenshot-image');
      if (screenshotDiv) {
        screenshotDiv.remove();
      }
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
  };

  // scroll to bottom when new message is added
  useEffect(() => {
    // hack to scroll to bottom
    const element = document.getElementById('chat-message-list');
    if (element?.firstElementChild) {
      element.firstElementChild.scrollTop = element.firstElementChild.scrollHeight;
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

  // useEffect to check if localStorage['screenshot'] is changed
  useEffect(() => {
    const element = document.querySelector('.cs-button--attachment');
    if (element) {
      // append a div element which contains the image
      if (localStorage.getItem('screenshot')) {
        const screenshotDiv = document.createElement('div');
        screenshotDiv.id = 'screenshot-image';
        const thumbnail = document.createElement('img');
        thumbnail.src = localStorage.getItem('screenshot') || '';
        screenshotDiv.appendChild(thumbnail);
        element.appendChild(screenshotDiv);
      } else {
        // remove children from element
        element.innerHTML = `<svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 4.00033H10.4C8.15979 4.00033 7.03969 4.00033 6.18404 4.4363C5.43139 4.81979 4.81947 5.43172 4.43597 6.18436C4 7.04001 4 8.16012 4 10.4003V21.6003C4 23.8405 4 24.9606 4.43597 25.8163C4.81947 26.5689 5.43139 27.1809 6.18404 27.5644C7.03969 28.0003 8.15979 28.0003 10.4 28.0003H22.6667C23.9066 28.0003 24.5266 28.0003 25.0353 27.864C26.4156 27.4942 27.4938 26.416 27.8637 25.0356C28 24.5269 28 23.907 28 22.667M25.3333 10.667V2.66699M21.3333 6.66699H29.3333M14 11.3337C14 12.8064 12.8061 14.0003 11.3333 14.0003C9.86057 14.0003 8.66667 12.8064 8.66667 11.3337C8.66667 9.8609 9.86057 8.66699 11.3333 8.66699C12.8061 8.66699 14 9.8609 14 11.3337ZM19.9867 15.8912L8.7082 26.1444C8.07382 26.7211 7.75663 27.0095 7.72857 27.2593C7.70425 27.4758 7.78727 27.6905 7.95091 27.8344C8.13971 28.0003 8.56837 28.0003 9.42571 28.0003H21.9413C23.8602 28.0003 24.8196 28.0003 25.5732 27.678C26.5193 27.2733 27.2729 26.5196 27.6776 25.5736C28 24.82 28 23.8605 28 21.9416C28 21.296 28 20.9732 27.9294 20.6725C27.8407 20.2947 27.6706 19.9408 27.431 19.6355C27.2403 19.3926 26.9883 19.1909 26.4841 18.7876L22.7544 15.8039C22.2499 15.4002 21.9976 15.1984 21.7197 15.1271C21.4748 15.0644 21.2172 15.0725 20.9767 15.1506C20.7039 15.2392 20.4648 15.4565 19.9867 15.8912Z" stroke="#475467" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
      }
    }
  }, [screenshot]);

  // handle on screenshot click
  const onScreenshotClick = (evt: MouseEvent<HTMLButtonElement>) => {
    onStartCapture();
  };

  return (
    <MainContainer className="pl-4">
      <ChatContainer>
        <MessageList
          id="chat-message-list"
          autoScrollToBottom={true}
          autoScrollToBottomOnMount={false}
          scrollBehavior="smooth"
          typingIndicator={isTyping ? <TypingIndicator content="" /> : null}
        >
          {messages.map((message, i) => {
            return message.type === 'custom' && CustomMessageComponent ? (
              <Message
                key={i}
                model={{direction: 'incoming', type: 'custom', position: 'normal'}}
                className="geoda-custom-message"
              >
                <Message.CustomContent className="w-full">
                  <CustomMessageComponent props={message.payload ?? {}} />
                </Message.CustomContent>
              </Message>
            ) : (
              <Message
                key={i}
                model={message}
                style={{display: `${message.message?.length || 0 > 0 ? 'block' : 'none'}`}}
                draggable={true}
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
        </MessageList>
        <MessageInput
          placeholder={intl.formatMessage({
            id: 'chatGpt.inputPlaceholder',
            defaultMessage: 'Type your question here'
          })}
          onSend={handleSend}
          className="fill-current text-black dark:text-white"
          onAttachClick={onScreenshotClick}
        />
      </ChatContainer>
    </MainContainer>
  );
};
