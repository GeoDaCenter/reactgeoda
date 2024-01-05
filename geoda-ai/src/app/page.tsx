'use client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '../styles/globals.css';
import '../styles/styleguide.css';
import '../styles/style.css';
import '../styles/navigator-style.css';
import '../styles/open-file-modal-style.css';

// import dynamic from 'next/dynamic';
import {Provider as ReduxProvider} from 'react-redux';
import store from '../store';
import GridLayout from '../components/grid-layout';
// import FileHandler from '../components/file-handler';
// import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '../components/intl-provider-wrapper';
import {Navigator} from '../components/navigator';
// import {OpenFileModal} from '../components/open-file-modal';
// import KeplerMap from '../components/kepler-map';
// const KeplerMap = dynamic(() => import('../components/kepler-map'), { ssr: false });
// const DuckDBTableModal = dynamic(() => import('../components/duckdb-table-modal'), {ssr: false});

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
          </div>
          <div className="prop-box" />
          {/* <OpenFileModal />
          <DuckDBTableModal /> */}
        </div>
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}
