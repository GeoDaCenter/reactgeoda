import React, {useState} from 'react';
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
  Selection,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from '@nextui-org/react';
import {Icon} from '@iconify/react';
import {GeoDaState} from '../../store';
import {setAIConfig, setIsOpenAIKeyChecked, setMessages} from '../../actions';
import {accordionItemClasses} from '@/constants';
import {WarningBox, WarningType} from '../common/warning-box';
import {testApiKey} from 'soft-ai';

const PROVIDER_MODELS = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo-0125', 'gpt-3.5-turbo'],
  google: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.0-pro'],
  ollama: ['llama3.2', 'llama3.1', 'llama3.1:70b', 'qwen2', 'llava', 'mistral', 'gemma2', 'phi3.5'],
  anthropic: [
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0'
  ]
};

export function ChatGPTConfigComponent({
  setShowConfig
}: {
  setShowConfig: (showConfig: boolean) => void;
}) {
  const dispatch = useDispatch();

  const {isOpen, onOpen: onShowRestart, onOpenChange} = useDisclosure();

  const [showModalRestart, setShowModalRestart] = useState(false);

  // state for openAIKey error
  const [apiKeyError, setApiKeyError] = useState(false);

  // state for error message
  const [errorMessage, setErrorMessage] = useState('');

  // ai config
  const aiConfig = useSelector((state: GeoDaState) => state.root.ai.config);

  // define useState for key
  const [temperature, setTemperature] = useState<number>(aiConfig?.temperature || 1.0);

  const [topP, setTopP] = useState<number>(aiConfig?.topP || 0.8);

  const [key, setKey] = React.useState(aiConfig?.apiKey || '');

  const [provider, setProvider] = useState<'openai' | 'google' | 'ollama'>(
    (aiConfig?.provider as 'openai' | 'google' | 'ollama') || 'openai'
  );

  const [model, setModel] = useState<string>(aiConfig?.model || 'gpt-4o');

  const [baseUrl, setBaseUrl] = useState<string>(aiConfig?.baseUrl || 'http://127.0.0.1:11434');

  const [isRunning, setIsRunning] = useState(false);

  const onApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const keyValue = event.target.value;
    setKey(keyValue);

    // reset openAIKeyError
    setApiKeyError(false);

    // reset errorMessage
    setErrorMessage('');
  };

  const onBaseUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const baseUrlValue = event.target.value;
    setBaseUrl(baseUrlValue);
  };

  const checkInputsAreValid = () => {
    // check if provider is valid
    if (!(provider in PROVIDER_MODELS)) {
      return false;
    }
    // check if model is valid
    if (!PROVIDER_MODELS[provider as keyof typeof PROVIDER_MODELS].includes(model)) {
      return false;
    }
    // check if apiKey is valid
    if (key.length === 0 || key === 'Enter your OpenAI key here') {
      return false;
    }

    return true;
  };

  const checkIfNeedRestart = () => {
    if (
      aiConfig?.provider !== undefined &&
      aiConfig?.model !== undefined &&
      aiConfig?.temperature !== undefined &&
      aiConfig?.topP !== undefined &&
      (provider !== aiConfig?.provider ||
        model !== aiConfig?.model ||
        temperature !== aiConfig?.temperature ||
        topP !== aiConfig?.topP)
    ) {
      return true;
    }
    return false;
  };

  const onConfirmClick = async () => {
    if (checkInputsAreValid() === false) {
      setErrorMessage('Please check your model configuration and try again.');
      return;
    }

    setIsRunning(true);
    if (provider !== 'ollama') {
      // check if openai key is valid by trying to call testOpenAI function
      // if key is not valid, show error message
      const isValidKey = await testApiKey({
        modelProvider: provider,
        modelName: model,
        apiKey: key,
        baseUrl: baseUrl
      });
      dispatch(setIsOpenAIKeyChecked(isValidKey));
      if (!isValidKey) {
        setApiKeyError(true);
        setErrorMessage('Incorrect API key provided. Please check your API key and try again.');
      }
    } else {
      dispatch(setIsOpenAIKeyChecked(true));
    }

    // if need restart, clear the messages
    if (checkIfNeedRestart() === true) {
      dispatch(setMessages([]));
    }

    // set ai config, and start the chat
    dispatch(
      setAIConfig({
        provider: provider,
        model: model,
        apiKey: key,
        temperature: temperature,
        topP: topP,
        baseUrl: baseUrl
      })
    );

    setIsRunning(false);
    setShowConfig(false);
  };

  const onNoOpenAIKeyMessageClick = () => {
    // dispatch to show settings panel
    setApiKeyError(true);
    setErrorMessage('');
    setShowConfig(true);
  };

  const onModelChange = () => {
    // if model is changed, tell users that they need to restart the chat
    if (
      showModalRestart === false &&
      aiConfig?.provider !== undefined &&
      aiConfig?.model !== undefined
    ) {
      onShowRestart();
      // don't show the modal again
      setShowModalRestart(true);
    }
  };

  const onProviderChange = (selection: Selection) => {
    if (typeof selection === 'object' && 'currentKey' in selection) {
      const provider = selection.currentKey as 'openai' | 'google' | 'ollama';
      if (provider in PROVIDER_MODELS) {
        setProvider(provider);
        const defaultModel = PROVIDER_MODELS[provider][0];
        setModel(defaultModel);
        onModelChange();
      }
    }
  };

  const onLlmModelInputChange = (value: Selection) => {
    // @ts-ignore
    setModel(value.currentKey as string);
    onModelChange();
  };

  const onTemparatureChange = (value: number | number[]) => {
    if (typeof value !== 'number') {
      return;
    }
    setTemperature(value);
    onModelChange();
  };

  const onTopPChange = (value: number | number[]) => {
    if (typeof value !== 'number') {
      return;
    }
    setTopP(value);
    onModelChange();
  };

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
                selectedKeys={[provider]}
                label="AI Provider"
                placeholder="Select AI provider"
                className="max-w-full"
                onSelectionChange={onProviderChange}
              >
                <SelectItem key="openai">OpenAI ChatGPT</SelectItem>
                <SelectItem key="google">Google Gemini</SelectItem>
                <SelectItem key="ollama">Ollama</SelectItem>
              </Select>
              <Select
                label="LLM Model"
                placeholder="Select LLM model"
                className="max-w-full"
                onSelectionChange={onLlmModelInputChange}
                isInvalid={!PROVIDER_MODELS[provider].includes(model)}
                selectedKeys={model ? [model] : []}
              >
                {PROVIDER_MODELS[provider].map(model => (
                  <SelectItem key={model}>{model}</SelectItem>
                ))}
              </Select>
              {provider !== 'ollama' && apiKeyError && errorMessage.length > 0 && (
                <WarningBox
                  message={errorMessage}
                  type={WarningType.WARNING}
                  onClick={onNoOpenAIKeyMessageClick}
                />
              )}
              {provider !== 'ollama' && (
                <Input
                  type="string"
                  label="API Key"
                  defaultValue="Enter your OpenAI key here"
                  className="max-w-full"
                  onChange={onApiKeyChange}
                  value={key || ''}
                  required
                  isInvalid={apiKeyError || key.length === 0}
                />
              )}
              {provider === 'ollama' && (
                <Input
                  type="string"
                  label="Base URL"
                  defaultValue="http://127.0.0.1:11434"
                  placeholder="Enter your Ollama API URL here"
                  className="max-w-full"
                  required
                  onChange={onBaseUrlChange}
                />
              )}
              <Slider
                label="Temperature"
                step={0.1}
                maxValue={2}
                minValue={0}
                defaultValue={1.0}
                value={temperature}
                className="max-w-full"
                onChange={onTemparatureChange}
              />
              <Slider
                label="Top P"
                step={0.1}
                maxValue={1}
                minValue={0}
                defaultValue={0.8}
                value={topP}
                className="max-w-full"
                onChange={onTopPChange}
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
          className="mt-4 cursor-pointer bg-rose-900"
          onClick={onConfirmClick}
          isDisabled={checkInputsAreValid() == false}
          startContent={<Icon icon="hugeicons:ai-chat-02" className="h-5 w-5" />}
          isLoading={isRunning}
        >
          Let&apos;s Chat
        </Button>
        <Modal isOpen={isOpen} placement="center" onOpenChange={onOpenChange}>
          <ModalContent>
            {onClose => (
              <>
                <ModalHeader className="flex flex-col gap-2">Restart Chat</ModalHeader>
                <ModalBody>
                  <p>Changing the AI provider or model requires restarting the chat.</p>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="primary"
                    onPress={() => {
                      onClose();
                    }}
                  >
                    OK
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </>
  );
}
