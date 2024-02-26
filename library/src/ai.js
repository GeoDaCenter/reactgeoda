import React from 'react';
import { render } from 'react-dom';
import { useIntl } from 'react-intl';
import { Provider as ReduxProvider } from 'react-redux';
import { NextUIProvider } from '@nextui-org/react';

import store from '@webgeoda/store';
import IntlProviderWrapper from '@webgeoda/components/intl-provider-wrapper';
// import { ChatGPTComponent } from '@webgeoda/components/chatgpt/chatgpt-panel';
import { RightPanelContainer } from '@webgeoda/components/common/right-panel-template';
import { WarningBox } from '@webgeoda/components/common/warning-box';

import './style.css';

const ChatGPTPanel = () => {
  const intl = useIntl();

  // get api key from state.root
  const openAIKey = '';

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'chatGpt.title',
        defaultMessage: 'GeoDa.AI ChatBot',
      })}
      description={intl.formatMessage({
        id: 'chatGpt.description',
        defaultMessage: 'Powered by OpenAI',
      })}
    >
      {
        !openAIKey ? (
          <WarningBox
            message={'Please config your OpenAI API key '}
            type="warning"
          />
        ) : null
        // <ChatGPTComponent openAIKey={openAIKey} />
      }
    </RightPanelContainer>
  );
};

const Root = () => (
  <>
    <ChatGPTPanel />
  </>
);

const container =
  document.getElementById('root') ?? document.createElement('div');

render(
  <React.StrictMode>
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <NextUIProvider>
          <Root dataUrl={container.getAttribute('data-url')} />
        </NextUIProvider>
      </IntlProviderWrapper>
    </ReduxProvider>
  </React.StrictMode>,
  container
);
