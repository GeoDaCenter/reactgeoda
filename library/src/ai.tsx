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

const customFunctions = {
  histogram: function ({k, variableName}: {k: number; variableName: string}, {}) {
    // call histogram function
    // @ts-ignore-next-line This is a hack to communicate with desktop GeoDa
    window.wx_msg.postMessage({type: 'histogram', k, variableName});
    // const hist = createHistogram(columnData, k);

    return {
      type: 'histogram',
      name: 'Histogram',
      result: `Histogram for ${variableName} with ${k} bins has been created in GeoDa. Please check the new histogram window.`
    };
  }
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
      customMessageCallback: () => null
    });
    return response;
  }

  return (
    <div className="m-3 h-screen flex flex-col grow">
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
