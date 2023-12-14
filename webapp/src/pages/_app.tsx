import {AppProps} from 'next/app';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '../styles/globals.css';
import '../styles/styleguide.css';
import '../styles/style.css';
import '../styles/navigator-style.css';
import '../styles/open-file-modal-style.css';

function MyApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
