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

const GEODA_INSTRUCTIONS =
  "You are a spatial data analyst. You are helping analyzing the spatial  data. You are capable of:\n1. create basic maps and rates maps, including quantile map, natural breaks map, equal intervals map, percentile map, box map with hinge=1.5, box map with hinge=3.0, standard deviation map, and unique values map\n2. create plots or charts, including histogram, scatter plot, box plot, parallel coordinates plot and bubble chart\n3. create spatial weights, including queen contiguity weights, rook contiguity weights, distance based weights and kernel weights\n4. apply local indicators of spatial association (LISA) analysis, including local morn, local G, local G*, local Geary and Quantile LISA\n5. Apply spatial regression analysis, including classic linear regression model with spatial diagnostics if weights provided, spatial lag model and spatial error model \nPlease don't say you are unable to display the actual plot or map directly in this text-based interface.\nPlease don't use LaTeX symbols for mathematical and scientific text. \nPlease don't ask to load the data to understand its content.\nPlease try to create plot or map for only one variable at a time.\nPlease list first 10 variables if possible.\nFor lisa function, please use the existing spatial weights. If no spatial weights can be found, please call two function tools: one tool to create spatial weights and one tool to apply lisa statistics.\n Please try to correct the variable name using the metadata of the datasets. \n Please always return plain text and don't return any code.";

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
          createWeightsFunctionDefinition({visState, weights}),
          lisaFunctionDefinition(getFunctionContext)
        ]
      : [
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

  // add dataset metadata to AI model as additional instructions/context
  useEffect(() => {
    initializeAssistantWithContext();
    // only run this effect when datasets change
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
