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
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {useChatGPT} from '@/hooks/use-chatgpt';
import {WarningBox} from '../common/warning-box';

const ChatGPTPanel = () => {
  const intl = useIntl();
  const {initOpenAI, processMessage} = useChatGPT();

  const [messages, setMessages] = useState<Array<MessageModel>>([]);

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // get api key from state.root
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  useEffect(() => {
    setMessages([
      {
        message: intl.formatMessage({
          id: 'chatGpt.initialMessage',
          defaultMessage:
            "Hello, I'm GeoDa.AI powered by ChatGPT! Let's do spatial analysis! Ask me anything about your data."
        }),
        sentTime: 'just now',
        sender: 'ChatGPT',
        direction: 'incoming',
        position: 'first'
      }
    ]);
    if (openAIKey) {
      initOpenAI(openAIKey, tableName);
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
      setMessages([...newMessages, returnMessage]);
    }
    setIsTyping(false);
  };

  return (
    <div className="settings-panel">
      <div className="modal-header">
        <div className="content">
          <div className="text-and-supporting">
            <div className="text">GeoDa.AI ChatBot</div>
            <div className="supporting-text">Powered by ChatGPT</div>
          </div>
        </div>
        <div className="padding-bottom" />
        {!openAIKey ? (
          <WarningBox message={'Please config your OpenAI API key in Settings.'} />
        ) : !tableName ? (
          <WarningBox message={'Please load a map first before chatting.'} />
        ) : null}
      </div>
      <div className="form-wrapper text-sm!important">
        <MainContainer>
          <ChatContainer>
            <MessageList
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
              {messages.map((message, i) => (
                <Message key={i} model={message} />
              ))}
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
    </div>
  );
};

export default ChatGPTPanel;
