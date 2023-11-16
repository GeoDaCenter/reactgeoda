import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
 
import store from '@webgeoda/store';
import KeplerMap from '@webgeoda/components/kepler-map';

const Root = ({geojsonUrl, csvUrl, arrowUrl, parquetUrl, keplerUrl}) => (
  <Provider store={store}>
    <KeplerMap geojsonUrl={geojsonUrl} csvUrl={csvUrl} arrowUrl={arrowUrl} parquetUrl={parquetUrl} keplerUrl={keplerUrl} />
  </Provider>
);

window.store = store;

const container = document.getElementById('root') ?? document.createElement('div');
render(
  <React.StrictMode>
    <Root
      geojsonUrl={container.getAttribute('data-geojson')}
      csvUrl={container.getAttribute('data-csv')}
      arrowUrl={container.getAttribute('data-arrow')}
      parquetUrl={container.getAttribute('data-parquet')}
      keplerUrl={container.getAttribute('data-kepler')}
    />
  </React.StrictMode>,
  container
);
