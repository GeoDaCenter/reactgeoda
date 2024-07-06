'use client';

import React from 'react';
import {useIntl} from 'react-intl';
import {ScrollShadow} from '@nextui-org/react';

import {cn} from './cn';

import PromptInputWithBottomActions from './prompt-input-with-bottom-actions';
import Conversation from './conversation';
import {RightPanelContainer} from '../common/right-panel-template';
import {assistantMessages, userMessages} from './messages';

function ChatComponent({
  className,
  scrollShadowClassname
}: {
  className?: string;
  scrollShadowClassname?: string;
}) {
  const messages = [
    {
      role: 'user',
      message: userMessages[0]
    },
    {
      role: 'assistant',
      message: assistantMessages[0]
    },
    {
      role: 'user',
      message: userMessages[1]
    },
    {
      role: 'assistant',
      message: assistantMessages[1]
    }
  ];
  const onSendMessage = async () => {};

  return (
    <div className={cn('flex h-full w-full max-w-full flex-col gap-8 p-2', className)}>
      {/* <div className="flex w-full flex-wrap items-center justify-center gap-2 pb-2 sm:justify-between">
        <p className="text-base"></p>
        <Tabs className="justify-center">
          <Tab key="creative" title="Creative" />
          <Tab key="technical" title="Technical" />
          <Tab key="precise" title="Precise" />
        </Tabs>
      </div> */}
      <ScrollShadow className={cn('flex h-full flex-col', scrollShadowClassname)}>
        <Conversation messages={messages} />
      </ScrollShadow>
      <div className="flex flex-col gap-2">
        <PromptInputWithBottomActions onSendMessage={onSendMessage} />
        <p className="px-2 text-tiny text-default-400">
          GeoDa.AI can make mistakes. Consider checking information.
        </p>
      </div>
    </div>
  );
}

export function ChatPanel() {
  // Updated function name
  const intl = useIntl();

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'chatGpt.title',
        defaultMessage: 'GeoDa.AI Agent'
      })}
      description={intl.formatMessage({
        id: 'chatGpt.description',
        defaultMessage: 'Powered by GeoDa and LLM'
      })}
      icon={null}
    >
      <ChatComponent />
    </RightPanelContainer>
  );
}
