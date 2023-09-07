import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {Provider as ReduxProvider} from 'react-redux';
import * as Sentry from '@sentry/react';
import store from '../store';
import GridLayout from '../components/grid-layout';
import FileHandler from '../components/file-handler';
import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '../components/intl-provider-wrapper';
import {Demo} from '../components/demo';
import {Navigator} from '../components/navigator';

Sentry.init({
  dsn: 'https://a2f3a0fb7afcb544f2d58e5a79caa61b@o4505318856654848.ingest.sentry.io/4505840295477248',
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV === 'production'
});

export default function Home() {
  return (
    <ReduxProvider store={store}>
      <IntlProviderWrapper>
        <div className="react-geoda">
          <Navigator />
          <button onClick={() => methodDoesNotExist()}>Test Sentry</button>
          <div className="main-box">
            <div className="main-grid">
              <LanguageSelector />
              <FileHandler />
              <GridLayout />
              <Demo />
            </div>
          </div>
          <div className="prop-box" />
        </div>
      </IntlProviderWrapper>
    </ReduxProvider>
  );
}
