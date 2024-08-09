import React, {useEffect} from 'react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

import {useIntl} from 'react-intl';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '../../store';
import {Icon} from '@iconify/react';
import {WarningBox, WarningType} from '../common/warning-box';
import {RightPanelContainer} from '../common/right-panel-template';
import {ChatGPTComponent} from './chatgpt-component';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {addDatasetToAI} from '@/actions';
import {datasetsSelector} from '@/store/selectors';
import {DatasetProps} from '@/reducers/file-reducer';
import {ChatGPTConfigComponent} from './chatgpt-config';
import {Button, Tooltip} from '@nextui-org/react';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';
export const INVALID_OPENAI_KEY_MESSAGE =
  'The OpenAI API key is invalid. Please change your OpenAI API key in Settings.';
export const CONNECT_OPENAI_API = 'Connecting and initializing ...';

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

  const messages = useSelector((state: GeoDaState) => state.root.ai.messages);

  const [showConfig, setShowConfig] = React.useState(false);

  // check if datasetMeta has all the datasetIds from datasets
  const isDatasetMetaComplete = datasets.every(dataset => {
    return datasetMeta?.find(meta => meta.datasetId === dataset.dataId);
  });

  const onNoOpenAIKeyMessageClick = () => {
    setShowConfig(true);
  };

  const onClickConfig = () => {
    setShowConfig(true);
  };

  function onDatasetsChange(datasets: DatasetProps[]) {
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

  // useEffect(() => {
  //   async function onOpenAIKeyChange() {
  //     if (openAIKey) {
  //       const isValidKey = await testOpenAIKey(openAIKey);
  //       if (!isValidKey) {
  //         dispatch(setIsOpenAIKeyChecked(false));
  //         setStatus('failed');
  //         return;
  //       }
  //       await initOpenAI(
  //         openAIKey,
  //         GEODA_AI_ASSISTANT_NAME,
  //         GEODA_AI_ASSISTANT_BODY,
  //         GEODA_AI_ASSISTANT_VERSION
  //       );
  //       onDatasetsChange(datasets);
  //       dispatch(setIsOpenAIKeyChecked(true));
  //     }
  //   }
  //   onOpenAIKeyChange();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [openAIKey]);

  useEffect(() => {
    // check if datasets are processed as additional instructions for AI model
    if (isKeyChecked && openAIKey) {
      onDatasetsChange(datasets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, isKeyChecked]);

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
      {!openAIKey ? (
        <WarningBox
          message={NO_OPENAI_KEY_MESSAGE}
          type={WarningType.WARNING}
          onClick={onNoOpenAIKeyMessageClick}
        />
      ) : isKeyChecked === false || showConfig ? (
        <ChatGPTConfigComponent setShowConfig={setShowConfig} />
      ) : !datasetMeta && !isDatasetMetaComplete ? (
        <WarningBox
          message={CONNECT_OPENAI_API}
          type={WarningType.WAIT}
          onClick={onNoOpenAIKeyMessageClick}
        />
      ) : datasets?.length === 0 ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <ChatGPTComponent messages={messages.length > 0 ? messages : [welcomeMessage]} />
      )}
    </RightPanelContainer>
  );
};

export default ChatGPTPanel;
