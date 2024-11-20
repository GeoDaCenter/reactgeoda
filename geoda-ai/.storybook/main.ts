import {StorybookConfig} from '@storybook/nextjs';

const config: StorybookConfig = {
  framework: '@storybook/nextjs',
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    // '@storybook/addon-links',
    // '@storybook/addon-essentials',
    // '@storybook/addon-onboarding',
    // '@storybook/addon-interactions',
    'storybook-dark-mode'
  ],
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag'
  }
};

export default config;
