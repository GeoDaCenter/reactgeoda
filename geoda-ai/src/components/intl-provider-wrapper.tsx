import React from 'react';
import {useSelector} from 'react-redux';
import {IntlProvider} from 'react-intl';

import MESSAGES from '../translations/translations';
import {GeoDaState} from '../store';

type IntelProviderWrapperProps = {
  children?: React.ReactNode;
};

const IntlProviderWrapper = ({children}: IntelProviderWrapperProps) => {
  const language = useSelector((state: GeoDaState) => state.root.language);

  return (
    <IntlProvider messages={MESSAGES[language]} locale={language}>
      {children}
    </IntlProvider>
  );
};

export default IntlProviderWrapper;
