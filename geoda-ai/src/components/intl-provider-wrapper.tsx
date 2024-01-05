import React from 'react';
import {useSelector} from 'react-redux';
import {IntlProvider} from 'react-intl';
// import {messages, flattenMessages} from '@kepler.gl/localization';

import MESSAGES from '../translations/translations';
import {GeoDaState} from '../store';

type IntelProviderWrapperProps = {
  children?: React.ReactNode;
};

const IntlProviderWrapper = ({children}: IntelProviderWrapperProps) => {
  const language = useSelector((state: GeoDaState) => state.root.language);
  // const localeNames = [...Object.keys(MESSAGES), ...Object.keys(messages)];
  // const combinedMessages = localeNames.reduce((prev, cur) => {
  //   return {...prev, [cur]: {...MESSAGES[cur], ...messages[cur]}};
  // }, {});

  return (
    <IntlProvider messages={MESSAGES[language]} locale={language}>
      {children}
    </IntlProvider>
  );
};

export default IntlProviderWrapper;
