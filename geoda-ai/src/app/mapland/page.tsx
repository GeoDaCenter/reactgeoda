'use client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '@/styles/globals.css';
import '@/styles/style.css';

import {useRef} from 'react';
// import dynamic from 'next/dynamic';
import {Provider as ReduxProvider} from 'react-redux';
import {RootContext} from '@kepler.gl/components';

import store from '@/store';
import GridLayout from '@/components/grid-layout';
// import FileHandler from '../components/file-handler';
// import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import {Navigator} from '@/components/navigator';
import {OpenFileModal} from '@/components/open-file-modal';
import {PanelContainer} from '@/components/panel/panel-container';
import {TableContainer} from '@/components/table/table-container';

export default function Home() {
  const rootNode = useRef<HTMLDivElement>(null);

  return (
    <RootContext.Provider value={rootNode}>
      <ReduxProvider store={store}>
        <IntlProviderWrapper>
          <div className="min-w-100 flex h-screen w-screen flex-row items-start border-none">
            <Navigator />
            <div className="flex h-screen flex-1 flex-grow flex-col overflow-auto">
              <div className="flex-1 flex-grow p-0">
                <GridLayout />
              </div>
              <TableContainer />
            </div>
            <PanelContainer />
            <OpenFileModal />
            {/* <DuckDBTableModal /> */}
          </div>
        </IntlProviderWrapper>
      </ReduxProvider>
    </RootContext.Provider>
  );
}
