import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';

import store from '@webgeoda/store';
import KeplerMap from '@webgeoda/components/kepler-map';

const Root = ({geojsonUrl, csvUrl}) => (
  <Provider store={store}>
    <KeplerMap geojsonUrl={geojsonUrl} csvUrl={csvUrl} />
  </Provider>
);

const container = document.getElementById('root') ?? document.createElement('div');
render(
  <React.StrictMode>
    <Root
      geojsonUrl={container.getAttribute('data-geojson')}
      csvUrl={container.getAttribute('data-csv')}
    />
  </React.StrictMode>,
  container
);