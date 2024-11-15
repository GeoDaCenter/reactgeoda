import type {Meta, StoryObj} from '@storybook/react';
import {JoinTable} from './join-table';
import ThemeClient from '@/app/theme-client';

// Define the metadata for this component
const meta: Meta<typeof JoinTable> = {
  title: 'Components/Spatial Operations/Join Table',
  component: JoinTable,
  // Add decorators if needed
  decorators: [Story => <Story />],
  // Add parameters if needed
  parameters: {
    // Configure any necessary parameters
  }
};

export default meta;

// Define the story types
type Story = StoryObj<typeof JoinTable>;

// Light theme
export const LightTheme: Story = {
  render: () => (
    <ThemeClient theme="light">
      <JoinTable
        joinVariables={[
          {variableName: 'test', variableType: 'number'},
          {variableName: 'test2', variableType: 'string'}
        ]}
        onVariablesUpdated={() => {}}
      />
    </ThemeClient>
  )
};

// Dark theme
export const DarkTheme: Story = {
  render: () => (
    <ThemeClient theme="dark">
      <JoinTable
        joinVariables={[
          {variableName: 'test', variableType: 'number'},
          {variableName: 'test2', variableType: 'string'}
        ]}
        onVariablesUpdated={() => {}}
      />
    </ThemeClient>
  )
};
