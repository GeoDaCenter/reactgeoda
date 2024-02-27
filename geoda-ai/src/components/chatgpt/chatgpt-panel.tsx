import React from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {useChatGPT} from '@/hooks/use-chatgpt';
import {WarningBox} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {CustomMessage} from './custom-messages';
import {ChatGPTComponent} from './chatgpt-component';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const ChatGPTPanel = () => {
  const intl = useIntl();

  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // get api key from state.root
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

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
        />
      )}
    </RightPanelContainer>
  );
};

export default ChatGPTPanel;
