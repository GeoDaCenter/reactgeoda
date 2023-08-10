import {Provider as ReduxProvider} from 'react-redux';
import React, {useEffect} from 'react';
import dynamic from 'next/dynamic';
import {render} from 'react-dom';

import store from '../store';
import IntlProviderWrapper from '../components/IntlProviderWrapper';

const KeplerMap = dynamic(() => import('../components/KeplerMap'), {ssr: false});

export default function Home() {
  useEffect(() => {
    // eslint-disable-next-line no-undef
    let container = document?.getElementById('app') ?? document?.getElementById('__next');
    if (container) {
      const geojsonUrl = container.getAttribute('data-geojson') ?? '/asserts/data.geojson';
      render(
        <ReduxProvider store={store}>
          <IntlProviderWrapper>
            <KeplerMap geojsonUrl={geojsonUrl} />
          </IntlProviderWrapper>
        </ReduxProvider>,
        container
      );
    }
  }, []);

  return null;
}
