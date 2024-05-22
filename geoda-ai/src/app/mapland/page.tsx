'use client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '@/styles/globals.css';
import '@/styles/style.css';
import '@/styles/superfine.css';
import '@/styles/maplibre-gl.css';

import {useRef} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {RootContext} from '@kepler.gl/components';

import store from '@/store';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import ThemeProviderWrapper from '@/components/theme-provider-wrapper';
import {useSearchParams} from 'next/navigation';
import {MainConatiner} from '@/components/main-container';

export default function Home() {
  const rootNode = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();

  const projectUrl = searchParams.get('project');

  return (
    <RootContext.Provider value={rootNode}>
      <ReduxProvider store={store}>
        <ThemeProviderWrapper>
          <IntlProviderWrapper>
            <MainConatiner projectUrl={projectUrl} />
          </IntlProviderWrapper>
        </ThemeProviderWrapper>
      </ReduxProvider>
    </RootContext.Provider>
  );
}
