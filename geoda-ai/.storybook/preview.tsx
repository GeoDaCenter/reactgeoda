import type {Preview} from '@storybook/react';

import '@/styles/globals.css';
import React from 'react';

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  },
  decorators: [
    (Story: React.ComponentType) => {
      return <Story />;
    }
  ]
};

export default preview;
