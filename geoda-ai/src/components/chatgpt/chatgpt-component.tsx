import React, {useState, useEffect} from 'react';
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
    streamMessage: (delta: string, customMessage?: MessageModel) => void
  ) => void;
  // the function to return a component to render custom message
  getCustomMessageComponent?: () => React.FC<{props: any}>;
  // initial messages
  messages: Array<MessageModel>;
  // update message callback function
  setMessages: (messages: MessageModel[]) => void;
};

export const ChatGPTComponent = ({
  openAIKey,
  initOpenAI,
  processMessage,
  getCustomMessageComponent,
  messages,
  setMessages
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

    // process input message to chatgpt
    await processMessage(message, (deltaMessage: string, customMessage?: MessageModel) => {
      if (deltaMessage.length > 0) {
        setIsTyping(false);
      }
      setMessages([
        ...newMessages,
        {message: deltaMessage, direction: 'incoming', sender: 'ChatGPT', position: 'normal'},
        ...(customMessage ? [customMessage] : [])
      ]);
    });
  };

  // scroll to bottom when new message is added
  useEffect(() => {
    // hack to scroll to bottom
    const element = document.getElementById('chat-message-list');
    if (element?.firstElementChild) {
      element.firstElementChild.scrollTop = element.firstElementChild.scrollHeight;
    }
  }, [messages]);

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
        />
      </ChatContainer>
    </MainContainer>
  );
};
