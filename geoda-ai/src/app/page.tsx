'use client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '../styles/globals.css';
import '../styles/styleguide.css';
import '../styles/style.css';
import '../styles/navigator-style.css';
import '../styles/open-file-modal-style.css';

import dynamic from 'next/dynamic';
import {Provider as ReduxProvider} from 'react-redux';
import store from '../store';
import GridLayout from '../components/grid-layout';
// import FileHandler from '../components/file-handler';
// import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '../components/intl-provider-wrapper';
import {Navigator} from '../components/navigator';
import {OpenFileModal} from '../components/open-file-modal';
import {PanelContainer} from '../components/panel/panel-container';
import {TableContainer} from '../components/table/table-container';

// use dynamic import so that WebWorker can be used with DuckDB WASM
// import {DuckDBTableModal} from '../components/duckdb-table-modal';
const DuckDBTableModal = dynamic(() => import('../components/table/duckdb-table-modal'), {
  ssr: false
});

export default function Home() {
  return (
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <div className="react-geoda">
          <Navigator />
          <div className="main-box">
            <div className="main-grid">
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
  );
}
