import React, {useState, useEffect} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator
} from '@chatscope/chat-ui-kit-react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

const systemMessage = {
  role: 'system',
  content:
    "Explain things like you're talking to a software professional with 2 years of experience."
};

const ChatGpt = () => {
  const data = useSelector(state => state.root.file.fileData);
  const intl = useIntl();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    setMessages([
      {
        message: intl.formatMessage({
          id: 'chatGpt.initialMessage',
          defaultMessage: "Hello, I'm ChatGPT! Ask me anything!"
        }),
        sentTime: 'just now',
        sender: 'ChatGPT'
      }
    ]);
  }, [intl]);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async message => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: 'user'
    };

    const newMessages = [...messages, newMessage];
    setMessages(newMessages);
    setIsTyping(true);

    await processMessageToChatGPT(newMessages, data);
  };

  async function processMessageToChatGPT(chatMessages, data) {
    let apiMessages = chatMessages.map(messageObject => {
      let role = messageObject.sender === 'ChatGPT' ? 'assistant' : 'user';
      return {role: role, content: messageObject.message};
    });

    let dataContent = typeof data === 'string' ? data : JSON.stringify(data);

    const apiRequestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        systemMessage,
        {role: 'system', content: dataContent}, // passing data
        ...apiMessages
      ]
    };

    await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    })
      .then(data => data.json())
      .then(data => {
        console.log(data);
        if (data && data.choices && data.choices.length > 0) {
          setMessages([
            ...chatMessages,
            {
              message: data.choices[0].message.content,
              sender: 'ChatGPT'
            }
          ]);
        } else {
          console.error('The data.choices is undefined or empty.');
        }
        setIsTyping(false);
      });
  }

  return (
    <AutoSizer>
      {({height, width}) => (
        <div
          style={{
            position: 'relative',
            height: `${height - 32}px`,
            width: `${width - 32}px`,
            padding: '16px'
          }}
        >
          <MainContainer>
            <ChatContainer>
              <MessageList
                scrollBehavior="smooth"
                typingIndicator={
                  isTyping ? (
                    <TypingIndicator
                      content={intl.formatMessage({
                        id: 'chatGpt.isTyping',
                        defaultMessage: 'ChatGPT is typing'
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
      )}
    </AutoSizer>
  );
};

export default ChatGpt;
