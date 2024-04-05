import React from 'react';
import {useSelector} from 'react-redux';
import {IntlProvider} from 'react-intl';

import {messages} from '@kepler.gl/localization';
import MESSAGES from '../translations/translations';
import {GeoDaState} from '../store';

type IntelProviderWrapperProps = {
  children?: React.ReactNode;
};

const IntlProviderWrapper = ({children}: IntelProviderWrapperProps) => {
  const language = useSelector((state: GeoDaState) => state.root.language || 'en');

  // combine MESSAGES[language] and messages[language]
  const combinedMessages = {
    ...MESSAGES[language],
    ...messages[language]
  };

  return (
    <IntlProvider messages={combinedMessages} locale={language}>
      {children}
    </IntlProvider>
  );
};

export default IntlProviderWrapper;
