import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import {AppProps} from 'next/app';

function MyApp({Component, pageProps}: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
