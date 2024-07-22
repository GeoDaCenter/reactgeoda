import React, {useEffect, useState} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {useChatGPT} from '@/hooks/use-chatgpt';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {ChatGPTComponent} from './chatgpt-component';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {setIsOpenAIKeyChecked, setMessages, setPropertyPanel} from '@/actions';
import {PanelName} from '../panel/panel-container';
import {testOpenAIKey} from '@/ai/openai-utils';
import {mainTableNameSelector} from '@/store/selectors';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';
export const INVALID_OPENAI_KEY_MESSAGE =
  'The OpenAI API key is invalid. Please change your OpenAI API key in Settings.';
export const CONNECT_OPENAI_API = 'Connecting...';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const DEFAULT_WELCOME_MESSAGE =
  "Hello, I'm GeoDa.AI agent! Let's do spatial analysis! How can I help you today?";

const ChatGPTPanel = () => {
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

  const tableName = useSelector(mainTableNameSelector);

  // get api key from state.root
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  const isKeyChecked = useSelector((state: GeoDaState) => state.root.uiState.isOpenAIKeyChecked);

  // check if openAIKey is valid
  const [openAIKeyValid, setOpenAIKeyValid] = useState<'checking' | 'success' | 'failed'>(
    isKeyChecked ? 'success' : 'checking'
  );

  useEffect(() => {
    if (openAIKey) {
      testOpenAIKey(openAIKey).then((isValid: boolean) => {
        setOpenAIKeyValid(isValid ? 'success' : 'failed');
        if (isValid) {
          dispatch(setIsOpenAIKeyChecked(true));
        }
      });
    }
  }, [dispatch, openAIKey]);

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
  const {initOpenAI, processChatGPTMessage, speechToText} = useChatGPT();

  const onNoOpenAIKeyMessageClick = () => {
    // dispatch to show settings panel
    dispatch(setPropertyPanel(PanelName.SETTINGS));
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'chatGpt.title',
        defaultMessage: 'GeoDa.AI Agent'
      })}
      description={intl.formatMessage({
        id: 'chatGpt.description',
        defaultMessage: 'Powered by GeoDa and LLM'
      })}
    >
      {!openAIKey ? (
        <WarningBox
          message={NO_OPENAI_KEY_MESSAGE}
          type={WarningType.WARNING}
          onClick={onNoOpenAIKeyMessageClick}
        />
      ) : openAIKeyValid !== 'success' ? (
        <WarningBox
          message={openAIKeyValid === 'checking' ? CONNECT_OPENAI_API : INVALID_OPENAI_KEY_MESSAGE}
          type={openAIKeyValid === 'checking' ? WarningType.WAIT : WarningType.WARNING}
          onClick={onNoOpenAIKeyMessageClick}
        />
      ) : !tableName ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <ChatGPTComponent
          openAIKey={openAIKey}
          initOpenAI={initOpenAI}
          processMessage={processChatGPTMessage}
          speechToText={speechToText}
          messages={messages.length > 0 ? messages : [welcomeMessage]}
          setMessages={updateMessages}
        />
      )}
    </RightPanelContainer>
  );
};

export default ChatGPTPanel;
