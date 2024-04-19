import React, {Key, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {Accordion, AccordionItem, Button, Input, Tab, Tabs} from '@nextui-org/react';

import {GeoDaState} from '../../store';
import {setOpenAIKey} from '../../actions';
import {RightPanelContainer} from '../common/right-panel-template';
import {accordionItemClasses} from '../lisa/local-moran-panel';
import {useSession, signIn, signOut} from 'next-auth/react';

export function SignIn() {
  const {data: session} = useSession();
  if (session && session.user) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <Button color="danger" onClick={() => signOut()}>
          Sign out
        </Button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <Button color="danger" onClick={() => signIn()}>
        Sign in
      </Button>
    </>
  );
}

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

  const [showUserSettings, setShowUserSettings] = useState(true);
  const onTabChange = (key: Key) => {
    setShowUserSettings(key === 'user-settings');
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
      <div className="h-full overflow-y-auto p-4">
        <Tabs
          aria-label="Options"
          variant="solid"
          color="warning"
          selectedKey={showUserSettings ? 'user-settings' : 'open-ai'}
          onSelectionChange={onTabChange}
        >
          <Tab key="user-settings" title="User Settings">
            <div className="flex flex-col gap-4 p-4">
              <SignIn />
            </div>
          </Tab>
          <Tab key="open-ai" title="OpenAI">
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
              <Button color="danger">Confirm</Button>
            </div>
          </Tab>
        </Tabs>
      </div>
    </RightPanelContainer>
  );
}
