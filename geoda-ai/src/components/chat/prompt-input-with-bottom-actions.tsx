'use client';

import React from 'react';
import {useAudioRecorder} from 'react-audio-voice-recorder';

import {Button, Tooltip, ScrollShadow, Badge} from '@nextui-org/react';
import {Icon} from '@iconify/react';

import {cn} from '../common/cn';

import PromptInput from './prompt-input';

type PromptInputWithBottomActionsProps = {
  onSendMessage: (message: string) => void;
  onVoiceMessage: (voice: Blob) => Promise<string>;
  onScreenshotClick?: () => void;
  onRemoveScreenshot?: () => void;
  enableAttachFile?: boolean;
  screenCaptured?: string;
  defaultPromptText?: string;
};

export default function Component({
  onSendMessage,
  onVoiceMessage,
  onScreenshotClick,
  onRemoveScreenshot,
  enableAttachFile,
  screenCaptured,
  defaultPromptText = ''
}: PromptInputWithBottomActionsProps) {
  const ideas = [
    {
      title: 'Create a quantile map ',
      description: 'using variable X'
    },
    {
      title: 'Create a histogram ',
      description: 'using variable X'
    },
    {
      title: 'Create a spatial weights ',
      description: 'queen, rook, or k-nearest neighbor'
    },
    {
      title: 'Run regression analysis ',
      description: 'Y ~ X1 + X2 + X3'
    }
  ];

  const [prompt, setPrompt] = React.useState<string>(defaultPromptText);

  const onSendClick = () => {
    onSendMessage(prompt);
    setPrompt('');
  };

  const [isShiftPressed, setIsShiftPressed] = React.useState(false);

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.shiftKey) {
      setIsShiftPressed(true);
    }
    if (event.key === 'Enter' && isShiftPressed) {
      if (prompt.length > 0) {
        onSendClick();
      }
      // prevent new line
      event.preventDefault();
    }
  };

  const onKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.shiftKey) {
      setIsShiftPressed(false);
    }
  };

  const onClickIdea = (e: React.MouseEvent<HTMLButtonElement>) => {
    const {textContent} = e.currentTarget;
    setPrompt(textContent || '');
  };

  const recorderControls = useAudioRecorder(
    {
      noiseSuppression: true,
      echoCancellation: true
    },
    err => console.table(err) // onNotAllowedOrFound
  );

  const onTalkClicked = async () => {
    if (recorderControls.isRecording) {
      recorderControls.stopRecording();
      if (recorderControls.recordingBlob) {
        const voice = await onVoiceMessage(recorderControls.recordingBlob);
        setPrompt(voice);
      }
    } else {
      recorderControls.startRecording();
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollShadow hideScrollBar className="flex flex-nowrap gap-2" orientation="horizontal">
        <div className="flex gap-2">
          {ideas.map(({title, description}, index) => (
            <Button
              onClick={onClickIdea}
              key={index}
              className="flex h-14 flex-col items-start gap-0"
              variant="flat"
            >
              <p>{title}</p>
              <p className="text-default-500">{description}</p>
            </Button>
          ))}
        </div>
      </ScrollShadow>
      <form className="flex w-full flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70">
        <div className="group flex gap-2 px-4 pt-4">
          {screenCaptured && screenCaptured.length > 0 && (
            <Badge
              isOneChar
              className="opacity-0 group-hover:opacity-100"
              content={
                <Button
                  isIconOnly
                  radius="full"
                  size="sm"
                  variant="light"
                  onPress={onRemoveScreenshot}
                >
                  <Icon className="text-foreground" icon="iconamoon:close-thin" width={16} />
                </Button>
              }
            >
              <img
                className="h-14 w-14 rounded-small border-small border-default-200/50 object-cover"
                src={screenCaptured}
              />
            </Badge>
          )}
        </div>
        <PromptInput
          classNames={{
            inputWrapper: '!bg-transparent shadow-none',
            innerWrapper: 'relative',
            input: 'pt-1 pl-2 pb-6 !pr-10 text-medium'
          }}
          endContent={
            <div className="flex items-end gap-2">
              <Tooltip showArrow content="Send message">
                <Button
                  isIconOnly
                  color={!prompt ? 'default' : 'primary'}
                  isDisabled={!prompt}
                  radius="lg"
                  size="sm"
                  variant="solid"
                  onClick={onSendClick}
                >
                  <Icon
                    className={cn(
                      '[&>path]:stroke-[2px]',
                      !prompt ? 'text-default-600' : 'text-primary-foreground'
                    )}
                    icon="solar:arrow-up-linear"
                    width={20}
                  />
                </Button>
              </Tooltip>
            </div>
          }
          minRows={3}
          radius="lg"
          value={prompt}
          variant="flat"
          onValueChange={setPrompt}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        />
        <div className="flex w-full items-center justify-between  gap-2 overflow-scroll px-4 pb-4">
          <div className="flex w-full gap-1 md:gap-3">
            <Button
              size="sm"
              startContent={
                <Icon
                  className="text-default-500"
                  icon="solar:gallery-minimalistic-linear"
                  width={18}
                />
              }
              variant="flat"
              onClick={onScreenshotClick}
            >
              Take a Screenshot to Ask
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:soundwave-linear" width={18} />
              }
              endContent={
                recorderControls.isRecording && (
                  <svg
                    className="h-4 w-4 animate-spin text-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      className="opacity-75"
                      cx="12"
                      cy="12"
                      r="4"
                      strokeWidth="0"
                      fill="red"
                    />
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
                    <path
                      className="opacity-50"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      fill="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )
              }
              variant="flat"
              onClick={onTalkClicked}
            >
              Talk to Ask
            </Button>
            {enableAttachFile && (
              <Button
                size="sm"
                startContent={
                  <Icon className="text-default-500" icon="solar:paperclip-linear" width={18} />
                }
                variant="flat"
              >
                Attach
              </Button>
            )}
          </div>
          <p className="py-1 text-tiny text-default-400">{prompt.length}/2000</p>
        </div>
      </form>
    </div>
  );
}
