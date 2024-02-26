import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import store from '@webgeoda/store';
import App from './app';

const Root = ({ dataUrl }) => (
  <Provider store={store}>
    <App dataUrl={dataUrl} />
  </Provider>
);

const container =
  document.getElementById('root') ?? document.createElement('div');

render(
  <React.StrictMode>
    <Root dataUrl={container.getAttribute('data-url')} />
  </React.StrictMode>,
  container
);
