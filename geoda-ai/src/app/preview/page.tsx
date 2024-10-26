'use client';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '@/styles/globals.css';
import '@/styles/style.css';
import '@/styles/superfine.css';
import '@/styles/maplibre-gl.css';

import {useState, useEffect, useRef} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {RootContext} from '@kepler.gl/components';
import {Icon} from '@iconify/react';
import store from '@/store';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import ThemeProviderWrapper from '@/components/theme-provider-wrapper';
import {useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import {DuckDB} from '@/hooks/use-duckdb';
import {useGeoDa} from '@/hooks/use-geoda';
const MainConatiner = dynamic(() => import('@/components/main-container'), {ssr: false});
// import MainConatiner from '@/components/main-container';

export default function Home() {
  const rootNode = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const projectUrl = searchParams.get('project');
  const [isDuckDBReady, setIsDuckDBReady] = useState(false);

  useGeoDa();

  // Initialize DuckDB and set ready state
  useEffect(() => {
    async function initDuckDB() {
      await DuckDB.getInstance().initDuckDB();
      setIsDuckDBReady(true);
    }
    initDuckDB();
  }, []);

  if (!isDuckDBReady) {
    return (
      <div
        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}
      >
        <Icon icon="eos-icons:three-dots-loading" width="120" height="120" />
      </div>
    );
  }

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
