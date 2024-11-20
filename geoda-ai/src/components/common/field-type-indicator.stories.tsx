import type {Meta, StoryObj} from '@storybook/react';
import {FieldTypeIndicator} from './field-type-indicator';
import ThemeClient from '@/app/theme-client';

const meta: Meta<typeof FieldTypeIndicator> = {
  title: 'Common/FieldTypeIndicator',
  component: FieldTypeIndicator,
  tags: ['autodocs'],
  argTypes: {
    variableType: {
      control: 'select',
      options: ['string', 'number', 'boolean', 'date', 'array', 'object']
    }
  }
};

export default meta;
type Story = StoryObj<typeof FieldTypeIndicator>;

export const Default: Story = {
  args: {
    variableType: 'string'
  }
};

export const AllTypes: Story = {
  render: () => (
    <ThemeClient theme={'light'}>
      <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
        <FieldTypeIndicator variableType="string" />
        <FieldTypeIndicator variableType="number" />
        <FieldTypeIndicator variableType="boolean" />
        <FieldTypeIndicator variableType="date" />
        <FieldTypeIndicator variableType="array" />
        <FieldTypeIndicator variableType="object" />
      </div>
    </ThemeClient>
  )
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  render: () => {
    return (
      <ThemeClient theme={'dark'}>
        <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
          <FieldTypeIndicator variableType="string" />
          <FieldTypeIndicator variableType="number" />
          <FieldTypeIndicator variableType="boolean" />
          <FieldTypeIndicator variableType="date" />
          <FieldTypeIndicator variableType="array" />
          <FieldTypeIndicator variableType="object" />
        </div>
      </ThemeClient>
    );
  }
};
