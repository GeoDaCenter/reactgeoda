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
  Selection
} from '@nextui-org/react';
import {Icon} from '@iconify/react';
import {GeoDaState} from '../../store';
import {setAIConfig, setIsOpenAIKeyChecked} from '../../actions';
import {accordionItemClasses, MODEL_PROVIDERS} from '@/constants';
import {WarningBox, WarningType} from '../common/warning-box';
import {GetAssistantModelByProvider} from '@openassistant/core';

export function ChatGPTConfigComponent({
  setShowConfig
}: {
  setShowConfig: (showConfig: boolean) => void;
}) {
  const dispatch = useDispatch();

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
    if (!(provider in MODEL_PROVIDERS)) {
      return false;
    }
    // check if model is valid
    if (!MODEL_PROVIDERS[provider as keyof typeof MODEL_PROVIDERS].models.includes(model)) {
      return false;
    }
    // check if apiKey is valid
    if (provider !== 'ollama' && (key.length === 0 || key === 'Enter your OpenAI key here')) {
      return false;
    }

    return true;
  };

  const onConfirmClick = async () => {
    if (checkInputsAreValid() === false) {
      setErrorMessage('Please check your model configuration and try again.');
      return;
    }

    setIsRunning(true);

    // check if openai key is valid by trying to call testOpenAI function
    // if key is not valid, show error message
    const AssistantModel = GetAssistantModelByProvider({
      provider: provider
    });
    const testResult = await AssistantModel?.testConnection(key, model);

    dispatch(setIsOpenAIKeyChecked(testResult || false));

    if (!testResult) {
      setApiKeyError(true);
      const message =
        provider === 'ollama'
          ? 'Connection failed. Maybe incorrect base URL provided.'
          : 'Connection failed. Maybe incorrect API key provided.';
      setErrorMessage(message);
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

  const onProviderChange = (selection: Selection) => {
    if (typeof selection === 'object' && 'currentKey' in selection) {
      const provider = selection.currentKey as 'openai' | 'google' | 'ollama';
      if (provider in MODEL_PROVIDERS) {
        setProvider(provider);
        const defaultModel = MODEL_PROVIDERS[provider].models[0];
        setModel(defaultModel);
      }
    }
  };

  const onLlmModelInputChange = (value: Selection) => {
    // @ts-ignore
    setModel(value.currentKey as string);
  };

  const onTemparatureChange = (value: number | number[]) => {
    if (typeof value !== 'number') {
      return;
    }
    setTemperature(value);
  };

  const onTopPChange = (value: number | number[]) => {
    if (typeof value !== 'number') {
      return;
    }
    setTopP(value);
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
                {Object.keys(MODEL_PROVIDERS).map(provider => (
                  <SelectItem key={provider}>
                    {MODEL_PROVIDERS[provider as keyof typeof MODEL_PROVIDERS].name}
                  </SelectItem>
                ))}
              </Select>
              <Select
                label="LLM Model"
                placeholder="Select LLM model"
                className="max-w-full"
                onSelectionChange={onLlmModelInputChange}
                isInvalid={!MODEL_PROVIDERS[provider].models.includes(model)}
                selectedKeys={model ? [model] : []}
              >
                {MODEL_PROVIDERS[provider].models.map(model => (
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
      </div>
    </>
  );
}
