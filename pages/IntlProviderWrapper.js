import { useSelector } from "react-redux";
import { IntlProvider } from "react-intl";
import MESSAGES from '../translations/translations';

const IntlProviderWrapper = ({ children }) => {
  const language = useSelector(state => state.root.language);
  const messages = MESSAGES[language];

  return (
    <IntlProvider messages={messages} locale={language} defaultLocale="en">
      {children}
    </IntlProvider>
  );
}

export default IntlProviderWrapper;