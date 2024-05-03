import React, {Key, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useIntl} from 'react-intl';
import {
  Accordion,
  AccordionItem,
  Button,
  Input,
  Tab,
  Tabs,
  Card,
  CardBody
} from '@nextui-org/react';

import {GeoDaState} from '../../store';
import {setOpenAIKey} from '../../actions';
import {RightPanelContainer} from '../common/right-panel-template';
import {accordionItemClasses} from '@/constants';
import {useSession, signIn, signOut} from 'next-auth/react';

export function SignIn() {
  const {data: session} = useSession();
  const handleCognitoSignIn = () => {
    signIn('cognito-general');
  };
  const handleGoogleSignIn = () => {
    signIn('cognito-google');
  };
  if (session && session.user) {
    return (
      <>
        <Card>
          <CardBody>
            <div className="flex flex-col gap-4 p-4">
              Signed in as {session.user.email} <br />
              <Button color="danger" onClick={() => signOut({callbackUrl: '/logout'})}>
                Sign out
              </Button>
            </div>
          </CardBody>
        </Card>
      </>
    );
  }
  return (
    <>
      <Card>
        <CardBody>
          <div className="flex flex-col gap-4 p-4">
            <p>Login to your account</p>
            <Button className="login-with-google-btn" onClick={handleGoogleSignIn}>
              Continue with Google
            </Button>
            <Button color="danger" onClick={handleCognitoSignIn}>
              Sign in
            </Button>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export function SettingsPanel() {
  const intl = useIntl();
  const [showUserSettings, setShowUserSettings] = useState(true);
  const onTabChange = (key: Key) => {
    setShowUserSettings(key === 'user-settings');
  };

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
      <div className="h-full overflow-y-auto p-4">
        <Tabs
          aria-label="Options"
          variant="solid"
          color="warning"
          selectedKey={showUserSettings ? 'user-settings' : 'open-ai'}
          onSelectionChange={onTabChange}
        >
          <Tab key="user-settings" title="User Settings">
            <SignIn />
          </Tab>
          <Tab key="open-ai" title="OpenAI">
            <Card>
              <CardBody>
                <div className="flex flex-col gap-4 text-sm">
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
              </CardBody>
            </Card>
          </Tab>
        </Tabs>
      </div>
    </RightPanelContainer>
  );
}
