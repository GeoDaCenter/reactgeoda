import {setScreenCaptured} from '@/actions';
import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {ScreenCapture} from 'react-screen-capture';

import GridLayout from '@/components/dashboard/grid-layout';
import {Navigator} from '@/components/navigator';
import {TableContainer} from '@/components/table/table-container';
import {PanelContainer} from '@/components/panel/panel-container';
import {SaveProjectModal} from '@/components/save-project-modal';

import dynamic from 'next/dynamic';
const OpenFileModal = dynamic(() => import('@/components/open-file-modal'), {ssr: false});

export function MainConatiner({projectUrl}: {projectUrl: string | null}) {
  const dispatch = useDispatch();

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
    // setScreenshot(screenCaptureSource);
    dispatch(setScreenCaptured(screenCaptureSource));
    return null;
  };

  useEffect(() => {
    // clean localStorage
    localStorage.removeItem('screenshot');
  }, []);

  return (
    <>
      {/*
      // @ts-ignore */}
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
            <PanelContainer onStartCapture={onStartCapture} />
            <OpenFileModal projectUrl={projectUrl} />
            <SaveProjectModal />
          </div>
        )}
      </ScreenCapture>
    </>
  );
}
