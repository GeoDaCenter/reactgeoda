import React, {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {AiAssistant, RegisterFunctionCallingProps, MessageModel, useAssistant} from 'soft-ai';
import {GeoDaState} from '@/store';
import {addDatasetMeta, setMessages, setScreenCaptured, setStartScreenCapture} from '@/actions';
import {DuckDB} from '@/hooks/use-duckdb';
import {MAP_ID} from '@/constants';
import {useIntl} from 'react-intl';
import {datasetsSelector} from '@/store/selectors';
import {
  getMetaDataCallback,
  MetaDataCallbackOutput
} from '@/ai/assistant/callbacks/callback-metadata';
import {ErrorOutput} from '@/ai/assistant/custom-functions';
import {WarningBox, WarningType} from '../common/warning-box';
import {CONNECT_OPENAI_API} from './chatgpt-panel';
import {createMapFunctionDefinition} from '@/ai/assistant/callbacks/callback-map';
import {lisaFunctionDefinition} from '@/ai/assistant/callbacks/callback-lisa';
import {createWeightsFunctionDefinition} from '@/ai/assistant/callbacks/callback-weights';
import {createVariableFunctionDefinition} from '@/ai/assistant/callbacks/callback-table';
import {spatialRegressionFunctionDefinition} from '@/ai/assistant/callbacks/callback-regression';
import {WeightsProps} from '@/reducers/weights-reducer';
import {createPlotFunctionDefinition} from '@/ai/assistant/callbacks/callback-plot';

export const NO_OPENAI_KEY_MESSAGE = 'Please config your OpenAI API key in Settings.';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const GEODA_INSTRUCTIONS =
  "You are a spatial data analyst. You are helping analyzing the spatial  data. You are capable of:\n1. create basic maps and rates maps, including quantile map, natural breaks map, equal intervals map, percentile map, box map with hinge=1.5, box map with hinge=3.0, standard deviation map, and unique values map\n2. create plots or charts, including histogram, scatter plot, box plot, parallel coordinates plot and bubble chart\n3. create spatial weights, including queen contiguity weights, rook contiguity weights, distance based weights and kernel weights\n4. apply local indicators of spatial association (LISA) analysis, including local morn, local G, local G*, local Geary and Quantile LISA\n5. Apply spatial regression analysis, including classic linear regression model with spatial diagnostics if weights provided, spatial lag model and spatial error model \nPlease don't say you are unable to display the actual plot or map directly in this text-based interface.\nPlease don't use LaTeX symbols for mathematical and scientific text. \nPlease don't ask to load the data to understand its content.\nPlease try to create plot or map for only one variable at a time.\nPlease list first 10 variables if possible.\nFor lisa function, please use the existing spatial weights. If no spatial weights can be found, please call two function tools: one tool to create spatial weights and one tool to apply lisa statistics.\n Please try to correct the variable name using the metadata of the datasets. \n Please don't return any code snippet.";

const DEFAULT_WELCOME_MESSAGE =
  "Hello, I'm GeoDa.AI agent! Let's do spatial analysis! How can I help you today?";

const DEFAULT_PROMPT_IDEAS = [
  {
    title: 'Create a quantile map ',
    description: 'using variable X'
  },
  {
    title: 'Create a histogram ',
    description: 'using variable X'
  },
  {
    title: 'Create a spatial weights ',
    description: 'queen, rook, or k-nearest neighbor'
  },
  {
    title: 'Run regression analysis ',
    description: 'Y ~ X1 + X2 + X3'
  }
];

export const ChatGPTComponent = () => {
  const intl = useIntl();
  const dispatch = useDispatch<any>();

  const welcomeMessage = intl.formatMessage({
    id: 'GeoDa.AI.initialMessage',
    defaultMessage: DEFAULT_WELCOME_MESSAGE
  });

  // if in dashboard mode, the message should be draggable
  const isMessageDraggable = useSelector((state: GeoDaState) => state.root.uiState.showGridView);

  const llmConfig = useSelector((state: GeoDaState) => state.root.ai.config);

  const messages = useSelector((state: GeoDaState) => state.root.ai.messages);

  const screenCaptured = useSelector((state: GeoDaState) => state.root.uiState.screenCaptured);

  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState);

  const weights = useSelector((state: GeoDaState) => state.root.weights);

  const queryValuesBySQL = DuckDB.getInstance().queryValuesBySQL;

  const visStateRef = useRef(visState);
  visStateRef.current = visState;

  const weightsRef = useRef<WeightsProps[]>([]);
  weightsRef.current = weights;

  // define a function to return latest weights from state
  const getFunctionContext = () => {
    return {
      visState: visStateRef.current,
      weights: weightsRef.current
    };
  };

  const onMessagesUpdated = (messages: MessageModel[]) => {
    dispatch(setMessages(messages));
  };

  const onScreenshotClick = useCallback(() => {
    // dispatch to set startScreenCapture to true
    dispatch(setStartScreenCapture(true));
  }, [dispatch]);

  const onRemoveScreenshot = useCallback(() => {
    dispatch(setScreenCaptured(''));
  }, [dispatch]);

  // handle report question
  const onFeedback = (question: string) => {
    // report the question
    // open this link in a new tab
    const url = `https://github.com/orgs/geodaai/discussions/new?category=bugs&title=[AI Assistant Issue]Your Title&body=[Your Report]%0A%0A>${question}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // NOTE: ollama with e.g. llama3.1 cannot support more than 4 complex functions
  const functions: RegisterFunctionCallingProps[] =
    llmConfig?.provider === 'ollama'
      ? [
          createMapFunctionDefinition({visState}),
          createPlotFunctionDefinition({visState}),
          createWeightsFunctionDefinition({visState}),
          lisaFunctionDefinition(getFunctionContext)
        ]
      : [
          createMapFunctionDefinition({visState}),
          createPlotFunctionDefinition({visState}),
          createWeightsFunctionDefinition({visState}),
          lisaFunctionDefinition(getFunctionContext),
          createVariableFunctionDefinition({visState, queryValues: queryValuesBySQL}),
          spatialRegressionFunctionDefinition({visState, weights})
        ];

  const {initializeAssistant, restartChat, addAdditionalContext, apiKeyStatus} = useAssistant({
    modelProvider: llmConfig?.provider || 'openai',
    model: llmConfig?.model || 'gpt-4o',
    apiKey: llmConfig?.apiKey || '',
    instructions: GEODA_INSTRUCTIONS,
    functions: functions
  });

  const datasets = useSelector(datasetsSelector);

  const datasetMeta = useSelector((state: GeoDaState) => state.root.ai.datasetMeta);

  // restart chat if messages are empty
  useEffect(() => {
    const restartChatIfEmpty = async () => {
      await restartChat();
    };

    if (messages.length === 0) {
      restartChatIfEmpty();
    }
  }, [messages, restartChat]);

  // add dataset metadata to AI model as additional instructions/context
  useEffect(() => {
    async function addDatasetToAI() {
      await initializeAssistant();
      // check if datasets are processed as additional instructions for AI model
      if (apiKeyStatus === 'success') {
        // find datasetIds from datasets that are not in datasetMeta
        const datasetIds = datasets.map(dataset => dataset.dataId);
        const datasetIdsNotInMeta = datasetIds.filter(
          datasetId => !datasetMeta?.find(meta => meta.datasetId === datasetId)
        );
        // add dataset to AI
        datasetIdsNotInMeta.forEach(async datasetId => {
          const datasetName = datasets.find(dataset => dataset.dataId === datasetId)?.fileName;
          if (datasetName && datasetId) {
            // get meta data of the dataset
            const newMetaData: MetaDataCallbackOutput | ErrorOutput = getMetaDataCallback(
              {datasetName, datasetId},
              {tableName: datasetName, visState}
            );
            if (newMetaData.type === 'metadata') {
              const textDatasetMeta = JSON.stringify(newMetaData);
              const message = `Please use the metadata of the following datasets to help users applying spatial data analysis: ${textDatasetMeta}. Note: please do not respond to this prompt.`;

              // add dataset metadata as additional instructions for AI model
              await addAdditionalContext({
                context: message
              });

              dispatch(addDatasetMeta(newMetaData.result));
            }
          }
        });
      }
    }
    addDatasetToAI();
    // only run this effect when datasets or apiKeyStatus change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets, apiKeyStatus]);

  // check if datasetMeta has all the datasetIds from datasets
  const isDatasetMetaComplete = datasets.every(dataset => {
    return datasetMeta?.find(meta => meta.datasetId === dataset.dataId);
  });

  return !isDatasetMetaComplete ? (
    <WarningBox message={CONNECT_OPENAI_API} type={WarningType.WAIT} />
  ) : (
    <AiAssistant
      modelProvider={llmConfig?.provider || 'openai'}
      model={llmConfig?.model || 'gpt-4o'}
      apiKey={llmConfig?.apiKey || ''}
      temperature={llmConfig?.temperature}
      topP={llmConfig?.topP}
      welcomeMessage={welcomeMessage}
      historyMessages={messages}
      instructions={GEODA_INSTRUCTIONS}
      ideas={DEFAULT_PROMPT_IDEAS}
      assistantAvatar="/img/geoda-ai-chat.png"
      functions={functions}
      isMessageDraggable={isMessageDraggable}
      screenCapturedBase64={screenCaptured}
      onScreenshotClick={() => onScreenshotClick()}
      onRemoveScreenshot={() => onRemoveScreenshot()}
      onFeedback={onFeedback}
      onMessagesUpdated={onMessagesUpdated}
    />
  );
};
