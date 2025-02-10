import {setScreenCaptured, setStartScreenCapture} from '@/actions';
import {useDispatch, useSelector} from 'react-redux';
import {ScreenshotWrapper} from '@openassistant/ui';

import {Navigator} from '@/components/navigator';
import {TableContainer} from '@/components/table/table-container';
import {PanelContainer} from '@/components/panel/panel-container';
import {SaveProjectModal} from '@/components/save-project-modal';
import {ChatPanelContainer} from '@/components/panel/chat-panel';

import dynamic from 'next/dynamic';
const OpenFileModal = dynamic(() => import('@/components/open-file-modal'), {ssr: false});
const GridLayout = dynamic(() => import('@/components/dashboard/grid-layout'), {ssr: false});
import {AddDatasetModal} from '@/components/open-file-modal';
import {GeoDaState} from '@/store';

export default function MainContainerWithScreenCapture({projectUrl}: {projectUrl: string | null}) {
  const dispatch = useDispatch();

  // get startScreenCapture from redux state
  const startScreenCapture = useSelector(
    (state: GeoDaState) => state.root.uiState.startScreenCapture
  );

  const onSetScreenCaptured = (value: string) => {
    dispatch(setScreenCaptured(value));
  };

  const onSetStartScreenCapture = (value: boolean) => {
    dispatch(setStartScreenCapture(value));
  };

  return (
    <ScreenshotWrapper
      setScreenCaptured={onSetScreenCaptured}
      startScreenCapture={startScreenCapture}
      setStartScreenCapture={onSetStartScreenCapture}
      saveScreenshot={true}
    >
      <div className="min-w-100 relative flex h-screen w-screen flex-row items-start border-none">
        <Navigator />
        <div className="shadow-[rgba(0,0,15,0.5)_10px_0px_10px_0px]">
          <PanelContainer />
        </div>
        <div className="flex h-screen flex-1 flex-grow flex-col overflow-auto">
          <div className="flex-1 flex-grow p-0">
            <GridLayout />
          </div>
          <TableContainer />
        </div>
        <ChatPanelContainer />
        <OpenFileModal projectUrl={projectUrl} />
        <AddDatasetModal />
        <SaveProjectModal />
      </div>
    </ScreenshotWrapper>
  );
}
