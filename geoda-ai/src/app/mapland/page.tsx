'use client';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'react-responsive-modal/styles.css';

import '@/styles/globals.css';
import '@/styles/style.css';
import '@/styles/superfine.css';
import '@/styles/maplibre-gl.css';

import {useEffect, useRef, useState} from 'react';
import {Provider as ReduxProvider} from 'react-redux';
import {ScreenCapture} from 'react-screen-capture';
import {RootContext} from '@kepler.gl/components';

import store from '@/store';
import GridLayout from '@/components/dashboard/grid-layout';
// import FileHandler from '../components/file-handler';
// import LanguageSelector from '../components/language-selector';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import {Navigator} from '@/components/navigator';
import {TableContainer} from '@/components/table/table-container';
import ThemeProviderWrapper from '@/components/theme-provider-wrapper';
import {SaveProjectModal} from '@/components/save-project-modal';
import {useSearchParams} from 'next/navigation';
import {PanelContainer} from '@/components/panel/panel-container';

// the following components used use-duckdb hook and should be loaded dynamically
import dynamic from 'next/dynamic';
const OpenFileModal = dynamic(() => import('@/components/open-file-modal'), {ssr: false});

export default function Home() {
  const rootNode = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();

  const projectUrl = searchParams.get('project');

  const [screenshot, setScreenshot] = useState<string | undefined>(undefined);

  const onScreenCapture = (url: string) => {
    const screenCaptureSource = url;
    // save file
    // const downloadLink = document.createElement('a');
    // const fileName = 'react-screen-capture.png';

    // downloadLink.href = screenCaptureSource;
    // downloadLink.download = fileName;
    // downloadLink.click();
    // store the screen capture source to localStorage
    localStorage.setItem('screenshot', screenCaptureSource);
    setScreenshot(screenCaptureSource);
    return null;
  };

  useEffect(() => {
    // clean localStorage
    localStorage.removeItem('screenshot');
  }, []);

  return (
    <RootContext.Provider value={rootNode}>
      <ReduxProvider store={store}>
        <ThemeProviderWrapper>
          <IntlProviderWrapper>
            <ScreenCapture onEndCapture={onScreenCapture}>
              {({onStartCapture}: {onStartCapture: () => null}) => (
                <div className="min-w-100 flex h-screen w-screen flex-row items-start border-none">
                  <Navigator />
                  <div className="flex h-screen flex-1 flex-grow flex-col overflow-auto">
                    <div className="flex-1 flex-grow p-0">
                      <GridLayout />
                    </div>
                    <TableContainer />
                  </div>
                  <PanelContainer onStartCapture={onStartCapture} screenshot={screenshot} />
                  <OpenFileModal projectUrl={projectUrl} />
                  <SaveProjectModal />
                </div>
              )}
            </ScreenCapture>
          </IntlProviderWrapper>
        </ThemeProviderWrapper>
      </ReduxProvider>
    </RootContext.Provider>
  );
}
