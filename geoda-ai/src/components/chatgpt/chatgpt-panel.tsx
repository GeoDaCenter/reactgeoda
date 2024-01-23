import React, {useState, useEffect} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  MessageModel,
  TypingIndicator,
  MessagePayload
} from '@chatscope/chat-ui-kit-react';
import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import {GeoDaState} from '../../store';
import {useChatGPT} from '@/hooks/use-chatgpt';
import {CustomFunctionNames} from '@/utils/custom-functions';
import {WarningBox} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {CustomMessagePayload, CreateCustomMessage} from './custom-messages';

const DEFAULT_WELCOME_MESSAGE =
  "Hello, I'm GeoDa.AI powered by ChatGPT! Let's do spatial analysis! Ask me anything about your data.";

const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const ChatGPTComponent = ({openAIKey}: {openAIKey: string}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const geodaState = useSelector((state: GeoDaState) => state);
  const {initOpenAI, processMessage} = useChatGPT();

  const [messages, setMessages] = useState<Array<MessageModel>>([]);

  useEffect(() => {
    setMessages([
      {
        message: intl.formatMessage({
          id: 'chatGpt.initialMessage',
          defaultMessage: DEFAULT_WELCOME_MESSAGE
        }),
        sentTime: 'just now',
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'first'
      }
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

  function renderCustomMessage(payload: MessagePayload, i: number) {
    const {functionName, functionArgs, output} = payload as CustomMessagePayload;
    if (
      functionName === CustomFunctionNames.QUANTILE_BREAKS ||
      functionName === CustomFunctionNames.NATURAL_BREAKS
    ) {
      return CreateCustomMessage({key: i, functionArgs, output, dispatch, geodaState});
    }
  }

  return (
    <AutoSizer>
      {({height, width}) => (
        <div
          style={{
            position: 'relative',
            height: `${height}px`,
            width: `${width}px`
          }}
        >
          <MainContainer>
            <ChatContainer>
              <MessageList
                autoScrollToBottom={true}
                scrollBehavior="smooth"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator
                      content={intl.formatMessage({
                        id: 'chatGpt.isTyping',
                        defaultMessage: 'GeoDa.AI is typing'
                      })}
                    />
                  ) : null
                }
              >
                {messages.map((message, i) => {
                  return message.type === 'custom' ? (
                    renderCustomMessage(message.payload, i)
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
              />
            </ChatContainer>
          </MainContainer>
        </div>
      )}
    </AutoSizer>
  );
};

const ChatGPTPanel = () => {
  const intl = useIntl();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // get api key from state.root
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'chatGpt.title',
        defaultMessage: 'GeoDa.AI ChatBot'
      })}
      description={intl.formatMessage({
        id: 'chatGpt.description',
        defaultMessage: 'Powered by ChatGPT'
      })}
    >
      {!openAIKey ? (
        <WarningBox message={NO_OPENAI_KEY_MESSAGE} type="warning" />
      ) : !tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <ChatGPTComponent openAIKey={openAIKey} />
      )}
    </RightPanelContainer>
  );
};

export default ChatGPTPanel;
