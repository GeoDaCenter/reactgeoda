import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import dynamic from 'next/dynamic';
import {Icon} from '@iconify/react';
import {GeoDaState} from '../../store';
import {setShowChatPanel} from '@/actions';
import {Splitter} from '../common/splitter';
import {DEFAULT_CHATPANEL_WIDTH} from '@/constants';
import {Button} from '@nextui-org/react';

const ChatGPTPanel = dynamic(() => import('../chatgpt/chatgpt-panel'), {ssr: false});

export const ChatPanelContainer = () => {
  const dispatch = useDispatch();

  const [panelWidth, setPanelWidth] = React.useState<number>(DEFAULT_CHATPANEL_WIDTH);

  // get showGridView from redux state
  const showChatPanel = useSelector((state: GeoDaState) => state.root.uiState.showChatPanel);

  const onCloseClick = useCallback(
    (event: React.MouseEvent) => {
      dispatch(setShowChatPanel(false));
      event.preventDefault();
      event.stopPropagation();
    },
    [dispatch]
  );

  return showChatPanel ? (
    <div
      className="relative flex h-screen flex-row bg-gray-50 dark:bg-stone-900"
      style={{width: panelWidth}}
    >
      <Splitter
        mode="horizontal"
        initialSize={panelWidth}
        onSplitterChange={setPanelWidth}
        minimumSize={DEFAULT_CHATPANEL_WIDTH}
      />
      <div className="relative flex flex-grow flex-col">
        <Button
          className="absolute right-1 top-1 z-10"
          isIconOnly={true}
          variant="light"
          size="sm"
          onClick={onCloseClick}
        >
          <Icon icon="system-uicons:window-collapse-right" width={18} />
        </Button>
        <div className="h-full" style={{width: `${panelWidth}px`}}>
          <ChatGPTPanel />
        </div>
      </div>
    </div>
  ) : null;
};
