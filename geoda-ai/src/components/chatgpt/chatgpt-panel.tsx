import React from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {useChatGPT} from '@/hooks/use-chatgpt';
import {WarningBox} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {CustomMessage} from './custom-messages';
import {ChatGPTComponent} from './chatgpt-component';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {setMessages} from '@/actions';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const DEFAULT_WELCOME_MESSAGE =
  "Hello, I'm GeoDa.AI chatbot! Let's do spatial analysis! Ask me anything about your data.";

const ChatGPTPanel = ({onStartCapture}: {onStartCapture: () => null}) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const welcomeMessage: MessageModel = {
    message: intl.formatMessage({
      id: 'GeoDa.AI.initialMessage',
      defaultMessage: DEFAULT_WELCOME_MESSAGE
    }),
    sentTime: 'just now',
    sender: 'ChatGPT',
    direction: 'incoming',
    position: 'first'
  };

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  // get api key from state.root
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  // get messages from state.root
  const messages = useSelector((state: GeoDaState) => state.root.ai.messages);

  // update message callback function
  const updateMessages = (messages: MessageModel[]) => {
    dispatch(setMessages(messages));
  };

  // or use local state
  // const [messages, setMessages] = useState<Array<MessageModel>>(
  //   initialMessages ?? [welcomeMessage]
  // );

  // useChatGPT hook
  const {initOpenAI, processChatGPTMessage} = useChatGPT();

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'chatGpt.title',
        defaultMessage: 'GeoDa.AI ChatBot'
      })}
      description={intl.formatMessage({
        id: 'chatGpt.description',
        defaultMessage: 'Powered by OpenAI'
      })}
    >
      {!openAIKey ? (
        <WarningBox message={NO_OPENAI_KEY_MESSAGE} type="warning" />
      ) : !tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : (
        <ChatGPTComponent
          openAIKey={openAIKey}
          initOpenAI={initOpenAI}
          processMessage={processChatGPTMessage}
          getCustomMessageComponent={() => CustomMessage}
          messages={messages.length > 0 ? messages : [welcomeMessage]}
          setMessages={updateMessages}
          onStartCapture={onStartCapture}
        />
      )}
    </RightPanelContainer>
  );
};

export default ChatGPTPanel;
