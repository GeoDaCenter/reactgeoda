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

const DEFAULT_WELCOME_MESSAGE =
  "Hello, I'm GeoDa.AI chatbot! Let's do spatial analysis! Ask me anything about your data.";

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

export type ChatGPTComponentProps = {
  openAIKey: string;
  // the function to initialize OpenAI js client
  initOpenAI: (apiKey: string) => void;
  // the function to process user prompt message and return response in array of MessageModel
  processMessage: (message: string) => Promise<Array<MessageModel>>;
  // the function to return a component to render custom message
  getCustomMessageComponent?: () => React.FC<{props: any}>;
};

export const ChatGPTComponent = ({
  openAIKey,
  initOpenAI,
  processMessage,
  getCustomMessageComponent
}: ChatGPTComponentProps) => {
  const intl = useIntl();
  const [messages, setMessages] = useState<Array<MessageModel>>([]);
  const CustomMessageComponent = getCustomMessageComponent && getCustomMessageComponent();

  useEffect(() => {
    // set initial message
    setMessages([
      {
        message: intl.formatMessage({
          id: 'GeoDa.AI.initialMessage',
          defaultMessage: DEFAULT_WELCOME_MESSAGE
        }),
        sentTime: 'just now',
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'first'
      }
      // test any custom message
      // {
      //   type: 'custom',
      //   message: '',
      //   sender: 'ChatGPT',
      //   direction: 'incoming',
      //   position: 'normal',
      //   payload: {
      //     type: 'custom',
      //     functionName: CustomFunctionNames.QUANTILE_BREAKS,
      //     functionArgs: {
      //       variable: 'HR60',
      //       k: 5
      //     },
      //     output: {
      //       quantile_breaks: [0.1, 0.2, 0.3, 0.4, 0.5]
      //     }
      //   }
      // }
    ]);
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

    // process input message to chatgpt
    const returnMessage = await processMessage(message);

    // display return message in dialog
    if (returnMessage) {
      setMessages([...newMessages, ...returnMessage]);
    }
    setIsTyping(false);
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
          typingIndicator={
            isTyping ? (
              <TypingIndicator
                content={intl.formatMessage({
                  id: 'GeoDa.AI.isTyping',
                  defaultMessage: 'GeoDa.AI is typing'
                })}
              />
            ) : null
          }
        >
          {messages.map((message, i) => {
            return message.type === 'custom' && CustomMessageComponent ? (
              <Message key={i} model={{direction: 'incoming', type: 'custom', position: 'normal'}}>
                <Message.CustomContent className="w-[283px]">
                  <CustomMessageComponent props={message.payload ?? {}} />
                </Message.CustomContent>
              </Message>
            ) : (
              <Message key={i} model={message} />
            );
          })}
        </MessageList>
        <MessageInput
          placeholder={intl.formatMessage({
            id: 'chatGpt.inputPlaceholder',
            defaultMessage: 'Type message here'
          })}
          onSend={handleSend}
          className="fill-current text-black dark:text-white"
        />
      </ChatContainer>
    </MainContainer>
  );
};
