import {AppProps} from 'next/app';
import {ThemeProvider} from 'styled-components';
import {themeLT} from '@kepler.gl/styles';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '../styles/globals.css';
import '../styles/styleguide.css';
import '../styles/style.css';
import '../styles/navigator-style.css';
import '../styles/open-file-modal-style.css';

function MyApp({Component, pageProps}: AppProps) {
  return (
    <>
      <ThemeProvider theme={themeLT}>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}

export default MyApp;
