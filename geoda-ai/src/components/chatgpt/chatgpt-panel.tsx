import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {Icon} from '@iconify/react';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {ChatGPTComponent} from './chatgpt-component';
import {datasetsSelector} from '@/store/selectors';
import {ChatGPTConfigComponent} from './chatgpt-config';
import {Button, Tooltip} from '@nextui-org/react';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const ChatGPTPanel = () => {
  const intl = useIntl();

  const datasets = useSelector(datasetsSelector);

  const isKeyChecked = useSelector((state: GeoDaState) => state.root.uiState.isOpenAIKeyChecked);

  const [showConfig, setShowConfig] = useState(false);

  const onClickConfig = () => {
    setShowConfig(true);
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
      <Tooltip content="AI Configuration" size="sm" placement="right">
        <Button
          className="absolute -top-12 right-1 z-10"
          isIconOnly={true}
          variant="light"
          size="sm"
          onClick={onClickConfig}
        >
          <Icon icon="mynaui:config" width={18} />
        </Button>
      </Tooltip>
      {isKeyChecked === false || showConfig ? (
        <ChatGPTConfigComponent setShowConfig={setShowConfig} />
      ) : datasets?.length === 0 ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <ChatGPTComponent />
      )}
    </RightPanelContainer>
  );
};

export default ChatGPTPanel;
