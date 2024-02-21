import React from 'react';
import {render} from '@testing-library/react';
import {useSelector} from 'react-redux';
import '@testing-library/jest-dom';
import {FormattedMessage} from 'react-intl';

import IntlProviderWrapper from '../../src/components/intl-provider-wrapper';

jest.mock('react-redux', () => {
  const reactIntl = jest.requireActual('react-intl');
  const intl = reactIntl.createIntl({
    locale: 'en'
  });

  return {
    useSelector: jest.fn(),
    useIntl: () => intl
  };
});

describe('IntlProviderWrapper default', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockReturnValue('en');
  });

  afterEach(() => {
    (useSelector as jest.Mock).mockReset();
  });

  it('renders children', () => {
    const {container, getByText} = render(
      <IntlProviderWrapper>
        <div>
          <FormattedMessage id="GeoDa.AI.isTyping" />
        </div>
      </IntlProviderWrapper>
    );

    expect(container).toBeDefined();
    expect(getByText('GeoDa.AI is typing')).toBeInTheDocument();
    // expect(intlProvider).toBeInTheDocument();
    // expect(intlProvider).toHaveAttribute('locale', 'en');
    // expect(intlProvider).toHaveAttribute('messages', JSON.stringify(MESSAGES.en));
  });
});

describe('IntlProviderWrapper Chinese', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockReturnValue('cn');
  });

  afterEach(() => {
    (useSelector as jest.Mock).mockReset();
  });
  it('renders IntlProvider with correct props', () => {
    const {container, getByText} = render(
      <IntlProviderWrapper>
        <div>
          <FormattedMessage id="GeoDa.AI.isTyping" />
        </div>
      </IntlProviderWrapper>
    );

    expect(container).toBeDefined();
    expect(getByText('GeoDa.AI正在输入')).toBeInTheDocument();
  });
});
