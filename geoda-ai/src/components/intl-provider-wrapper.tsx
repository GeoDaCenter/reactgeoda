import React from 'react';
import {useSelector} from 'react-redux';
import {IntlProvider} from 'react-intl';

import {messages} from '@kepler.gl/localization';
import MESSAGES from '../translations/translations';
// import {GeoDaState} from '../store';
import {keplerLocaleSelector} from '@/store/selectors';

type IntelProviderWrapperProps = {
  locale?: string;
  children?: React.ReactNode;
};

const IntlProviderWrapper = ({children}: IntelProviderWrapperProps) => {
  // const language = useSelector((state: GeoDaState) => state.root.language);
  const keplerLocale = useSelector(keplerLocaleSelector);

  // combine MESSAGES[language] and messages[language]
  const combinedMessages = {
    ...MESSAGES[keplerLocale],
    ...messages[keplerLocale]
  };

  return (
    <IntlProvider messages={combinedMessages} locale={keplerLocale || 'en'}>
      {children}
    </IntlProvider>
  );
};

export default IntlProviderWrapper;
