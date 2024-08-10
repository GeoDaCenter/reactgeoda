import React, {useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Slider,
  Selection
} from '@nextui-org/react';
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
    setShowConfig(true);
  };

  const onLlmModelChange = useCallback((keys: Selection) => {
    // @ts-ignore FIXME
    keys.currentKey;
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 overflow-y-auto pl-4 pr-4">
        <Accordion itemClasses={accordionItemClasses} defaultExpandedKeys={['1', '2']}>
          <AccordionItem
            key="1"
            aria-label="AI Settings"
            title="AI Settings"
            subtitle="Change your AI settings"
          >
            <div className="flex flex-col gap-4">
              <Select
                selectedKeys={['openai']}
                disabledKeys={['gemini', 'llama', 'qwen', 'custom']}
                label="AI Provider"
                placeholder="Select AI provider"
                className="max-w-full"
              >
                <SelectItem key="openai">OpenAI ChatGPT</SelectItem>
                <SelectItem key="gemini">Google Gemini</SelectItem>
                <SelectItem key="llama">Meta Llama</SelectItem>
                <SelectItem key="qwen">Alibaba QWen</SelectItem>
                <SelectItem key="custom">Custom Llama</SelectItem>
              </Select>
              <Select
                selectedKeys={['gpt-4o-2024-05-13']}
                label="LLM Model"
                placeholder="Select LLM model"
                className="max-w-full"
                onSelectionChange={onLlmModelChange}
              >
                <SelectItem key="gpt-4o-2024-05-13">gpt-4o-2024-05-13</SelectItem>
                <SelectItem key="gpt-4o-mini">gpt-4o-mini</SelectItem>
              </Select>
              {openAIKeyError && errorMessage.length > 0 && (
                <WarningBox
                  message={errorMessage}
                  type={WarningType.WARNING}
                  onClick={onNoOpenAIKeyMessageClick}
                />
              )}
              <Input
                type="string"
                label="API Key"
                defaultValue="Enter your OpenAI key here"
                className="max-w-full"
                onChange={onOpenAIKeyChange}
                value={key || ''}
                required
                isInvalid={openAIKeyError || key.length === 0}
              />
              <Slider
                label="Temperature"
                step={0.1}
                maxValue={1}
                minValue={0}
                defaultValue={0.8}
                className="max-w-full"
              />
              <Slider
                label="Top P"
                step={0.1}
                maxValue={1}
                minValue={0}
                defaultValue={0.8}
                className="max-w-full"
              />
            </div>
          </AccordionItem>
        </Accordion>
        <Card className="hidden">
          <CardHeader>
            <p className="text-small">Usage</p>
          </CardHeader>
          <CardBody></CardBody>
        </Card>
        <Button
          radius="sm"
          color="danger"
          className="mt-4 bg-rose-900"
          onClick={onConfirmClick}
          isDisabled={openAIKeyError || errorMessage.length > 0}
          startContent={<Icon icon="hugeicons:ai-chat-02" className="h-5 w-5" />}
        >
          Let&apos;s Chat
        </Button>
      </div>
    </>
  );
}
