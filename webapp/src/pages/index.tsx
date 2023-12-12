import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import {Provider as ReduxProvider, useSelector} from 'react-redux';
import store from '../store';
import GridLayout from '../components/grid-layout';
import FileHandler from '../components/file-handler';
import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '../components/intl-provider-wrapper';
import {Navigator} from '../components/navigator';
import {OpenFileModal} from '../components/open-file-modal';

export default function Home() {
  return (
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <div className="react-geoda">
          <Navigator />
          <div className="main-box">
            <div className="main-grid">
              <LanguageSelector />
              <FileHandler />
              <GridLayout />
            </div>
          </div>
          <div className="prop-box" />
          <OpenFileModal />
        </div>
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}
