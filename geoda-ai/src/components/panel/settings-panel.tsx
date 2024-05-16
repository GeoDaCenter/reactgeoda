import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Accordion, AccordionItem, Input} from '@nextui-org/react';

import {GeoDaState} from '../../store';
import {setOpenAIKey} from '../../actions';
import {RightPanelContainer} from '../common/right-panel-template';
import {accordionItemClasses} from '@/constants';
import {CreateButton} from '../common/create-button';

export function SettingsPanel() {
  const intl = useIntl();
  const dispatch = useDispatch();

  // define state openAIKey
  const openAIKey = useSelector((state: GeoDaState) => state.root.uiState.openAIKey);

  // define useState for key
  const [key, setKey] = React.useState(openAIKey || '');

  const onOpenAIKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const keyValue = event.target.value;
      setKey(keyValue);
      // dispatch action to update redux state state.root.uiState.openAIKey
      dispatch(setOpenAIKey(keyValue));
    },
    [dispatch]
  );

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
        <CreateButton
          onClick={function (): void {
            throw new Error('Function not implemented.');
          }}
          isDisabled={false}
        >
          Confirm
        </CreateButton>
      </div>
    </RightPanelContainer>
  );
}
