import {AppProps} from 'next/app';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import '../styles/globals.css';
import '../styles/styleguide.css';
import '../styles/style.css';
import '../styles/navigator-style.css';
import ErrorBoundary from '../components/error-boundary';

function MyApp({Component, pageProps}: AppProps) {
  return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )
}

export default MyApp;
