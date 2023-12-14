import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {Provider as ReduxProvider} from 'react-redux';
import store from '../store';
import GridLayout from '../components/grid-layout';
// import FileHandler from '../components/file-handler';
// import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '../components/intl-provider-wrapper';
import {Navigator} from '../components/navigator';
import {OpenFileModal} from '../components/open-file-modal';
import {DuckDBTableModal} from '../components/duckdb-table';
import KeplerMap from '../components/kepler-map';
import {ThemeProvider} from 'styled-components';
import {themeLT} from '@kepler.gl/styles';

export default function Home() {
  return (
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <ThemeProvider theme={themeLT}>
          <div className="react-geoda">
            <Navigator />
            <div className="main-box">
              <div className="main-grid">
                <KeplerMap />
              </div>
            </div>
            <div className="prop-box" />
            <OpenFileModal />
            <DuckDBTableModal />
          </div>
        </ThemeProvider>
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}
