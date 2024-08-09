import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Accordion, AccordionItem, Button, Input} from '@nextui-org/react';
import {Icon} from '@iconify/react';
import {GeoDaState} from '../../store';
import {setIsOpenAIKeyChecked, setOpenAIKey} from '../../actions';
import {accordionItemClasses} from '@/constants';
import {testOpenAIKey} from '@/ai/openai-utils';
import {WarningBox, WarningType} from '../common/warning-box';

export function ChatGPTConfigComponent({
  setShowConfig
}: {
  setShowConfig: (showConfig: boolean) => void;
}) {
  const dispatch = useDispatch();

  // state for openAIKey error
  const [openAIKeyError, setOpenAIKeyError] = useState(false);

  // state for error message
  const [errorMessage, setErrorMessage] = useState('');

  // define state openAIKey
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  // define useState for key
  const [key, setKey] = React.useState(openAIKey || '');

  const onOpenAIKeyChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const keyValue = event.target.value;
    setKey(keyValue);

    // reset openAIKeyError
    setOpenAIKeyError(false);
    // reset errorMessage
    setErrorMessage('');
  }, []);

  const onConfirmClick = useCallback(async () => {
    // check if openai key is valid by trying to call testOpenAI function
    // if key is not valid, show error message
    const isValidKey = await testOpenAIKey(key);
    if (!isValidKey) {
      setOpenAIKeyError(true);
      setErrorMessage(
        'Incorrect API key provided. You can find your API key at https://platform.openai.com/account/api-keys.'
      );
      dispatch(setOpenAIKey(undefined));
      dispatch(setIsOpenAIKeyChecked(false));
    } else {
      // dispatch action to update redux state state.root.uiState.openAIKey
      dispatch(setOpenAIKey(key));
      // dispatch action to update state.root.uiState.isOpenAIKeyChecked
      dispatch(setIsOpenAIKeyChecked(true));
      // close the config panel
      setShowConfig(false);
    }
  }, [dispatch, key, setShowConfig]);

  const onNoOpenAIKeyMessageClick = () => {
    // dispatch to show settings panel
    setOpenAIKeyError(true);
    setErrorMessage('');
  };

  return (
    <>
      {openAIKeyError && errorMessage.length > 0 ? (
        <WarningBox
          message={errorMessage}
          type={WarningType.WARNING}
          onClick={onNoOpenAIKeyMessageClick}
        />
      ) : (
        <div className="flex flex-col gap-4 p-4">
          <Accordion itemClasses={accordionItemClasses} defaultExpandedKeys={['1']}>
            <AccordionItem
              key="1"
              aria-label="OpenAI Settings"
              title="OpenAI Settings"
              subtitle="Change your OpenAI settings"
            >
              <Input
                type="string"
                label="OpenAI Key"
                defaultValue="Enter your OpenAI key here"
                className="max-w-full"
                onChange={onOpenAIKeyChange}
                value={key || ''}
              />
            </AccordionItem>
          </Accordion>
          <Button
            radius="sm"
            color="danger"
            className="bg-rose-900"
            onClick={onConfirmClick}
            isDisabled={false}
            startContent={<Icon icon="hugeicons:ai-chat-02" className="h-5 w-5" />}
          >
            Let&apos;s Chat
          </Button>
        </div>
      )}
    </>
  );
}
