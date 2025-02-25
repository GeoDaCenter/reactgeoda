import React, {useCallback, useEffect, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RegisterFunctionCallingProps, MessageModel, useAssistant} from '@openassistant/core';
import {AiAssistant} from '@openassistant/ui';
import {GeoDaState} from '@/store';
import {
  setDefaultPromptText,
  setMessages,
  setScreenCaptured,
  setStartScreenCapture
} from '@/actions';
import {DuckDB} from '@/hooks/use-duckdb';
import {MAP_ID} from '@/constants';
import {useIntl} from 'react-intl';
import {datasetsSelector} from '@/store/selectors';
import {
  getMetaDataCallback,
  MetaDataCallbackOutput
} from '@/ai/assistant/callbacks/callback-metadata';
import {ErrorOutput} from '@/ai/assistant/custom-functions';
import {createMapFunctionDefinition} from '@/ai/assistant/callbacks/callback-map';
import {lisaFunctionDefinition} from '@/ai/assistant/callbacks/callback-lisa';
import {createWeightsFunctionDefinition} from '@/ai/assistant/callbacks/callback-weights';
import {createVariableFunctionDefinition} from '@/ai/assistant/callbacks/callback-table';
import {spatialRegressionFunctionDefinition} from '@/ai/assistant/callbacks/callback-regression';
import {WeightsProps} from '@/reducers/weights-reducer';
import {createPlotFunctionDefinition} from '@/ai/assistant/callbacks/callback-plot';

export const NO_MAP_LOADED_MESSAGE = 'Please load a map first before chatting.';

const GEODA_INSTRUCTIONS = `You are a spatial data analyst using GeoDa library. You are helping analyzing the spatial  data.
You have following tools using function calling:
- create basic maps and rates maps
- create plots or charts
- create spatial weights
- apply local indicators of spatial association (LISA) analysis
- apply spatial regression analysis

When responding to user queries:
1. Analyze if the task requires one or multiple function calls
2. For each required function:
   - Identify the appropriate function to call
   - Determine all required parameters
   - If parameters are missing, ask the user to provide them
   - Please ask the user to confirm the parameters
   - If the user doesn't agree, try to provide variable functions to the user
   - Execute functions in a sequential order
3. For SQL query, please help to generate select query clause using the content of the dataset:
   - please use double quotes for table name
   - please only use the columns that are in the dataset context
   - please try to use the aggregate functions if possible
`;

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

  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);

  const llmConfig = useSelector((state: GeoDaState) => state.root.ai.config);

  const messages = useSelector((state: GeoDaState) => state.root.ai.messages);

  const screenCaptured = useSelector((state: GeoDaState) => state.root.uiState.screenCaptured);

  // TODO: we can't use entire visState because it contains too many variables that change too often
  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]?.visState);

  const weights = useSelector((state: GeoDaState) => state.root.weights);

  const screenCapturedPrompt = useSelector(
    (state: GeoDaState) => state.root.uiState.defaultPromptText
  );

  const queryValuesBySQL = DuckDB.getInstance().queryValuesBySQL;

  // use ref to store visState and weights so that they can be updated in useEffect e.g. getFunctionContext()
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
    dispatch(setDefaultPromptText(''));
  }, [dispatch]);

  const onFeedback = (question: string) => {
    // report the question
    // open this link in a new tab
    const url = `https://github.com/orgs/geodaai/discussions/new?category=bugs&title=[AI Assistant Issue]Your Title&body=[Your Report]%0A%0A>${question}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // NOTE: ollama with e.g. llama3.1 cannot support more than 4 complex functions
  const functions: RegisterFunctionCallingProps[] = [
    createMapFunctionDefinition({visState}),
    createPlotFunctionDefinition({visState}),
    createWeightsFunctionDefinition({visState, weights}),
    lisaFunctionDefinition(getFunctionContext),
    createVariableFunctionDefinition({visState, queryValues: queryValuesBySQL}),
    spatialRegressionFunctionDefinition({visState, weights})
  ];

  const assistantProps = {
    modelProvider: llmConfig?.provider || 'openai',
    model: llmConfig?.model || 'gpt-4o',
    apiKey: llmConfig?.apiKey || '',
    instructions: GEODA_INSTRUCTIONS,
    functions: functions,
    name: 'GeoDa.AI',
    version: '1.0'
  };

  const {initializeAssistant, addAdditionalContext} = useAssistant(assistantProps);

  const datasets = useSelector(datasetsSelector);

  const initializeAssistantWithContext = async () => {
    await initializeAssistant();
    let context = `Please remember the following dataset context:\n`;
    // get meta data of the dataset
    datasets.forEach(dataset => {
      if (!dataset.fileName || !dataset.dataId) {
        return null;
      }
      const datasetName = dataset.fileName;
      const datasetId = dataset.dataId;
      const newMetaData: MetaDataCallbackOutput | ErrorOutput = getMetaDataCallback(
        {datasetName, datasetId},
        {tableName: datasetName, visState}
      );
      const metaData = newMetaData.result as {
        datasetName: string;
        datasetId: string;
        columns: Record<string, string>;
      };
      context += `datasetName: ${metaData.datasetName}, datasetId: ${metaData.datasetId}, columns: ${JSON.stringify(Object.keys(metaData.columns))}.\n`;
    });
    addAdditionalContext({context});
  };

  // update dataset metadata to AI model as additional instructions/context
  useEffect(() => {
    initializeAssistantWithContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasets]);

  return (
    <AiAssistant
      {...assistantProps}
      theme={theme as 'dark' | 'light'}
      welcomeMessage={welcomeMessage}
      historyMessages={messages}
      ideas={DEFAULT_PROMPT_IDEAS}
      assistantAvatar="/img/geoda-ai-chat.png"
      isMessageDraggable={isMessageDraggable}
      screenCapturedBase64={screenCaptured}
      screenCapturedPrompt={screenCapturedPrompt}
      onScreenshotClick={() => onScreenshotClick()}
      onRemoveScreenshot={() => onRemoveScreenshot()}
      onFeedback={onFeedback}
      onMessagesUpdated={onMessagesUpdated}
      enableScreenCapture={llmConfig?.provider !== 'ollama'}
      enableVoice={llmConfig?.provider !== 'ollama'}
    />
  );
};
