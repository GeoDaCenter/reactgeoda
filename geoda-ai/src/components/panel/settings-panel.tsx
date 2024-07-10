import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Accordion, AccordionItem, Input} from '@nextui-org/react';

import {GeoDaState} from '../../store';
import {setOpenAIKey, setPropertyPanel} from '../../actions';
import {RightPanelContainer} from '../common/right-panel-template';
import {accordionItemClasses} from '@/constants';
import {CreateButton} from '../common/create-button';
import {PanelName} from '../panel/panel-container';
import {testOpenAIKey} from '@/ai/openai-utils';
import {WarningBox, WarningType} from '../common/warning-box';

export function SettingsPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // state for openAIKey error
  const [openAIKeyError, setOpenAIKeyError] = useState(false);

  // state for error message
  const [errorMessage, setErrorMessage] = useState('');

  // define state openAIKey
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  // define useState for key
  const [key, setKey] = React.useState(openAIKey || '');

  // load the openAIKey from local storage if openAIKey is not set
  useEffect(() => {
    if (!openAIKey) {
      const key = localStorage.getItem('openAIKey');
      if (key) {
        setKey(key);
        dispatch(setOpenAIKey(key));
      }
    }
  }, [openAIKey, dispatch]);

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
      return;
    }
    // dispatch action to update redux state state.root.uiState.openAIKey
    dispatch(setOpenAIKey(key));
    // dispatch action to show chatgpt panel
    dispatch(setPropertyPanel(PanelName.CHAT_GPT));
    // save the key to local storage
    localStorage.setItem('openAIKey', key);
  }, [dispatch, key]);

  const onNoOpenAIKeyMessageClick = () => {
    // dispatch to show settings panel
    setOpenAIKeyError(true);
    setErrorMessage('');
  };

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'settings.title',
        defaultMessage: 'Settings'
      })}
      description={intl.formatMessage({
        id: 'settings.description',
        defaultMessage: 'Change your personal settings'
      })}
    >
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
          <CreateButton onClick={onConfirmClick} isDisabled={false}>
            Confirm
          </CreateButton>
        </div>
      )}
    </RightPanelContainer>
  );
}
