import React from 'react';
import {render} from 'react-dom';
import {useIntl} from 'react-intl';
import {Provider as ReduxProvider} from 'react-redux';
import {NextUIProvider} from '@nextui-org/react';

import store from '@webgeoda/store';
import IntlProviderWrapper from '@webgeoda/components/intl-provider-wrapper';
import {ChatGPTComponent} from '@webgeoda/components/chatgpt/chatgpt-component';
import {RightPanelContainer} from '@webgeoda/components/common/right-panel-template';
import {WarningBox} from '@webgeoda/components/common/warning-box';
import {initOpenAI, processMessage} from '@webgeoda/ai/openai-utils';

import './style.css';
import '@webgeoda/styles/style.css';

let ws: WebSocket | null;

// response from websocket server
let response: any = null;

// initilize connection to websocket wait 600 ms until page fully loaded
setTimeout(async () => {
  ws = new WebSocket('ws://localhost:1982/echo');
  ws.addEventListener('open', event => {
    console.log('Connected to websocket server');
  });
  ws?.addEventListener('message', event => {
    console.log('Message from server ', event.data);
    // response = JSON.parse(event.data);
    response = event.data;
  });
}, 600);

// create a function that send message using websocket client, and then wait and get response from websocket server, return the response
const callGeoDa = async (message: Object) => {
  // wait until websocket connection is ready
  while (ws?.readyState === 0) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // send message to websocket server
  console.log('sending message', message);
  ws?.send(JSON.stringify(message));

  while (response === null) {
    // wait for 100ms until the websocket server returns something
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  // return response
  return response;
};

const customFunctions = {
  histogram: async function ({k, variableName}: {k: number; variableName: string}, {}) {
    // call histogram function
    // const hist = createHistogram(columnData, k);
    const result = await callGeoDa({type: 'histogram', k, variableName});
    console.log('result', result);

    return {
      type: 'histogram',
      name: 'Histogram',
      result: `Histogram for ${variableName} with ${k} bins has been created in GeoDa. Here is the result: ${result}`
    };
  },
  linearRegression: async function (
    {
      dependentVariable,
      independentVariables
    }: {dependentVariable: string; independentVariables: string[]},
    {}
  ) {
    // call linear regression function
    // const result = await linearRegression(columnData, k);
    const result = await callGeoDa({
      type: 'linearRegression',
      dependentVariable,
      independentVariables
    });
    console.log('result', result);

    return {
      type: 'linearRegression',
      name: 'Linear Regression',
      result
    };
  }
};

const customMessageCallback = ({
  functionName,
  functionArgs,
  output
}: {
  functionName: string;
  functionArgs: Record<string, unknown>;
  output: any;
}) => {
  console.log('customMessageCallback', functionName, functionArgs, output);
  if (functionName === 'histogram') {
    const {k, variableName} = functionArgs;
    // @ts-ignore-next-line This is a hack to communicate with desktop GeoDa
    window.wx_msg.postMessage({type: 'histogram', k, variableName});
  }
  // no custom message to render
  return null;
};

const ChatGPTPanel = () => {
  const intl = useIntl();

  // get api key from state.root
  const openAIKey = process.env.OPEN_AI_TOKEN;

  // custom function context
  const customFunctionContext = {};

  function processGeoDaMessage(message: string) {
    const response = processMessage({
      question: message,
      customFunctions,
      customFunctionContext,
      // no need to render custom message, just popup window
      customMessageCallback: customMessageCallback
    });
    return response;
  }

  return (
    <div className="m-3 flex h-screen grow flex-col">
      <RightPanelContainer
        title={intl.formatMessage({
          id: 'chatGpt.title',
          defaultMessage: 'GeoDa.AI Agent'
        })}
        description={intl.formatMessage({
          id: 'chatGpt.description',
          defaultMessage: 'Powered by GeoDa'
        })}
      >
        {!openAIKey ? (
          <WarningBox message={'Please config your OpenAI API key '} type="warning" />
        ) : (
          <ChatGPTComponent
            openAIKey={openAIKey}
            initOpenAI={initOpenAI}
            processMessage={processGeoDaMessage}
          />
        )}
      </RightPanelContainer>
    </div>
  );
};

const Root = (
  <React.StrictMode>
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <NextUIProvider>
          <ChatGPTPanel />
        </NextUIProvider>
      </IntlProviderWrapper>
    </ReduxProvider>
  </React.StrictMode>
);

const container = document.getElementById('root') ?? document.createElement('div');

render(Root, container);
