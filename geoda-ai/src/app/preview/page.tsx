'use client';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '@/styles/globals.css';
import '@/styles/style.css';
import '@/styles/superfine.css';
import '@/styles/maplibre-gl.css';
import 'react-toastify/dist/ReactToastify.css';

import {useState, useEffect, useRef} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {Bounce, ToastContainer} from 'react-toastify';
import {RootContext} from '@kepler.gl/components';
import store from '@/store';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import ThemeProviderWrapper from '@/components/theme-provider-wrapper';
import {useSearchParams} from 'next/navigation';
import dynamic from 'next/dynamic';
import {DuckDB} from '@/hooks/use-duckdb';
import {useGeoDa} from '@/hooks/use-geoda';
import {GeoDaLogo} from '@/components/navigator/geoda-logo';
const MainConatiner = dynamic(() => import('@/components/main-container'), {ssr: false});
// import MainConatiner from '@/components/main-container';

export default function Home() {
  const rootNode = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const projectUrl = searchParams.get('project');
  const [isDuckDBReady, setIsDuckDBReady] = useState(false);
  const [showPulse, setShowPulse] = useState(false);

  useGeoDa();

  // Initialize DuckDB and set ready state
  useEffect(() => {
    async function initDuckDB() {
      await DuckDB.getInstance().initDuckDB();
      setIsDuckDBReady(true);
    }
    initDuckDB();
  }, []);

  // Add this effect for pulse animation timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isDuckDBReady) {
    return (
      <div
        style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}
      >
        <div className={showPulse ? 'animate-pulse' : ''}>
          <GeoDaLogo height={64} width={64} showAnimation={true} />
        </div>
      </div>
    );
  }

  return (
    <RootContext.Provider value={rootNode}>
      <ReduxProvider store={store}>
        <ThemeProviderWrapper>
          <IntlProviderWrapper>
            <MainConatiner projectUrl={projectUrl} />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
              transition={Bounce}
            />
          </IntlProviderWrapper>
        </ThemeProviderWrapper>
      </ReduxProvider>
    </RootContext.Provider>
  );
}
