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
import {addDatasetToAI, setIsOpenAIKeyChecked, setMessages, setPropertyPanel} from '@/actions';
import {PanelName} from '../panel/panel-container';
import {testOpenAIKey} from '@/ai/openai-utils';
import {datasetsSelector} from '@/store/selectors';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';
export const INVALID_OPENAI_KEY_MESSAGE =
  'The OpenAI API key is invalid. Please change your OpenAI API key in Settings.';
export const CONNECT_OPENAI_API = 'Connecting...';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const DEFAULT_WELCOME_MESSAGE =
  "Hello, I'm GeoDa.AI agent! Let's do spatial analysis! How can I help you today?";

const ChatGPTPanel = () => {
  const intl = useIntl();
  const dispatch = useDispatch<any>();

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

  const datasets = useSelector(datasetsSelector);

  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  const isKeyChecked = useSelector((state: GeoDaState) => state.root.uiState.isOpenAIKeyChecked);

  const datasetMeta = useSelector((state: GeoDaState) => state.root.ai.datasetMeta);

  // check if openAIKey is valid
  const [openAIKeyValid, setOpenAIKeyValid] = useState<'checking' | 'success' | 'failed'>(
    isKeyChecked ? 'success' : 'checking'
  );

  // useChatGPT hook
  const {initOpenAI, processChatGPTMessage, speechToText} = useChatGPT();

  useEffect(() => {
    if (openAIKey) {
      testOpenAIKey(openAIKey).then((isValid: boolean) => {
        initOpenAI(openAIKey).then(() => {
          setOpenAIKeyValid(isValid ? 'success' : 'failed');
          if (isValid) {
            dispatch(setIsOpenAIKeyChecked(true));
          }
        });
      });
    }
  }, [dispatch, initOpenAI, openAIKey]);

  useEffect(() => {
    // check if datasets are processed as additional instructions for AI model
    if (openAIKeyValid === 'success' && openAIKey) {
      // find datasetIds from datasets that are not in datasetMeta
      const datasetIds = datasets.map(dataset => dataset.dataId);
      const datasetIdsNotInMeta = datasetIds.filter(
        datasetId => !datasetMeta?.find(meta => meta.datasetId === datasetId)
      );
      // add dataset to AI
      datasetIdsNotInMeta.forEach(datasetId => {
        const datasetName = datasets.find(dataset => dataset.dataId === datasetId)?.fileName;
        if (datasetName && datasetId) {
          dispatch(addDatasetToAI(datasetId, datasetName));
        }
      });
    }
  }, [datasetMeta, datasets, dispatch, initOpenAI, openAIKey, openAIKeyValid]);

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
      showAIHelp={false}
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
      ) : datasets?.length === 0 ? (
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
