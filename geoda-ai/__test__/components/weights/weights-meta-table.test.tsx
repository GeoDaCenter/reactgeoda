import '@testing-library/jest-dom';
import React from 'react';
import {render, screen} from '@testing-library/react';
import {IntlProvider} from 'react-intl';
import {WeightsMetaTable} from '@/components/weights/weights-meta-table';
import {WeightsMeta} from 'geoda-wasm';

// mock messages for internationalization
const messages = {
  'weights.meta.id': 'ID',
  'weights.meta.name': 'Name',
  'weights.meta.type': 'Type',
  'weights.meta.symmetry': 'Symmetry',
  'weights.meta.numberOfObservations': 'Number of Observations',
  'weights.meta.k': 'K Nearest Neighbors',
  'weights.meta.order': 'Order',
  'weights.meta.incLowerOrder': 'Include Lower Order',
  'weights.meta.threshold': 'Threshold',
  'weights.meta.distanceMetric': 'Distance Metric',
  'weights.meta.minNeighbors': 'Minimum Neighbors',
  'weights.meta.maxNeighbors': 'Maximum Neighbors',
  'weights.meta.meanNeighbors': 'Mean Neighbors',
  'weights.meta.medianNeighbors': 'Median Neighbors',
  'weights.meta.pctNoneZero': 'Percent Non-Zero',
  'table.noRows': 'No rows to display.'
};

describe('WeightsMetaTable', () => {
  const renderWithIntl = (component: React.ReactElement) => {
    return render(
      <IntlProvider messages={messages} locale="en">
        {component}
      </IntlProvider>
    );
  };

  const mockQueenWeightsMeta: WeightsMeta = {
    id: 'queen-1',
    type: 'queen',
    symmetry: 'symmetric',
    numberOfObservations: 100,
    order: 1,
    threshold: 0,
    minNeighbors: 2,
    maxNeighbors: 10,
    medianNeighbors: 4.3,
    meanNeighbors: 4.5,
    pctNoneZero: 0.45
  };

  it('renders the table with correct content', () => {
    renderWithIntl(<WeightsMetaTable weightsMeta={mockQueenWeightsMeta} />);

    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('queen-1')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('queen')).toBeInTheDocument();
    expect(screen.getByText('Symmetry')).toBeInTheDocument();
    expect(screen.getByText('symmetric')).toBeInTheDocument();
    expect(screen.getByText('Number of Observations')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Threshold')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('Minimum Neighbors')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Maximum Neighbors')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Mean Neighbors')).toBeInTheDocument();
    expect(screen.getByText('4.3')).toBeInTheDocument();
    expect(screen.getByText('Median Neighbors')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('Percent Non-Zero')).toBeInTheDocument();
    expect(screen.getByText('0.45')).toBeInTheDocument();
  });

  it('handles empty weights meta object', () => {
    // @ts-expect-error: testing with empty object
    renderWithIntl(<WeightsMetaTable weightsMeta={{}} />);

    expect(screen.getByText('No rows to display.')).toBeInTheDocument();
  });

  it('filters out undefined properties', () => {
    const partialMeta: Partial<WeightsMeta> = {
      id: 'queen-2',
      name: 'Test'
      // Omitting other properties
    };

    renderWithIntl(<WeightsMetaTable weightsMeta={partialMeta as WeightsMeta} />);

    // Should show these properties
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();

    // Should not show undefined properties
    expect(screen.queryByText('Type')).not.toBeInTheDocument();
    expect(screen.queryByText('Symmetry')).not.toBeInTheDocument();
  });
});
