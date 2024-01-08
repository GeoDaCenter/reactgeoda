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

export const ChatGPTPanel = () => {
  const data = useSelector((state: GeoDaState) => state.root.file.fileData);
  const intl = useIntl();
  const [messages, setMessages] = useState<Array<MessageModel>>([]);

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
  }, [intl]);

  const [isTyping, setIsTyping] = useState(false);

  const {processMessageToChatGPT} = useChatGPT();

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
    const returnMessage = await processMessageToChatGPT(newMessages, data);

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
      </div>
      <div className="form-wrapper">
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
