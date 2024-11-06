import '@testing-library/jest-dom';
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {IntlProvider} from 'react-intl';
import {WeightsManagementComponent} from '@/components/weights/weights-management';
import {WeightsProps} from '@/reducers/weights-reducer';

// Mock messages for internationalization
const messages = {
  'weights.management.noWeights': 'No Spatial Weights'
};

// Mock WeightsSelector and WeightsMetaTable components
jest.mock('@/components/weights/weights-selector', () => ({
  WeightsSelector: ({weights, onSelectWeights, weightsId}: any) => (
    <select
      data-testid="weights-selector"
      value={weightsId}
      onChange={e => onSelectWeights({currentKey: e.target.value})}
    >
      {weights.map((w: WeightsProps) => (
        <option key={w.weightsMeta.id} value={w.weightsMeta.id}>
          {w.weightsMeta.id}
        </option>
      ))}
    </select>
  )
}));

jest.mock('@/components/weights/weights-meta-table', () => ({
  WeightsMetaTable: ({weightsMeta}: any) => (
    <div data-testid="weights-meta-table">{weightsMeta.name}</div>
  )
}));

describe('WeightsManagementComponent', () => {
  const mockWeights: WeightsProps[] = [
    {
      weightsMeta: {
        id: 'queen-1',
        type: 'queen',
        symmetry: 'symmetric',
        numberOfObservations: 100,
        minNeighbors: 2,
        maxNeighbors: 10,
        meanNeighbors: 4.5,
        medianNeighbors: 4.3,
        pctNoneZero: 0.45
      },
      datasetId: 'dataset-1',
      weights: []
    },
    {
      weightsMeta: {
        id: 'rook-1',
        type: 'rook',
        symmetry: 'symmetric',
        numberOfObservations: 100,
        minNeighbors: 2,
        maxNeighbors: 10,
        meanNeighbors: 4.5,
        medianNeighbors: 4.3,
        pctNoneZero: 0.45
      },
      datasetId: 'dataset-2',
      weights: []
    }
  ];

  const renderWithIntl = (component: React.ReactElement) => {
    return render(
      <IntlProvider messages={messages} locale="en">
        {component}
      </IntlProvider>
    );
  };

  it('renders no weights message when weights array is empty', () => {
    renderWithIntl(<WeightsManagementComponent weights={[]} selectedWeightsId={null} />);

    expect(screen.getByText('No Spatial Weights')).toBeInTheDocument();
  });

  it('renders weights selector and meta table when weights are available', () => {
    renderWithIntl(
      <WeightsManagementComponent
        weights={mockWeights}
        selectedWeightsId={mockWeights[0].weightsMeta.id ?? null}
      />
    );

    expect(screen.getByTestId('weights-selector')).toBeInTheDocument();
    expect(screen.getByTestId('weights-meta-table')).toBeInTheDocument();
  });

  it('selects the provided selectedWeightsId by default', () => {
    renderWithIntl(
      <WeightsManagementComponent
        weights={mockWeights}
        selectedWeightsId={mockWeights[0].weightsMeta.id ?? null}
      />
    );

    const selector = screen.getByTestId('weights-selector') as HTMLSelectElement;
    expect(selector.value).toBe(mockWeights[0].weightsMeta.id);
  });

  it('updates selected weight when user changes selection', () => {
    renderWithIntl(
      <WeightsManagementComponent
        weights={mockWeights}
        selectedWeightsId={mockWeights[0].weightsMeta.id ?? null}
      />
    );

    const selector = screen.getByTestId('weights-selector');
    fireEvent.change(selector, {target: {value: mockWeights[1].weightsMeta.id}});

    // Check if meta table updates to show the newly selected weight
    expect(
      screen.getByText(mockWeights[1].weightsMeta.id ?? 'weightsMeta.id not available')
    ).toBeInTheDocument();
  });

  it('selects last weight when selectedWeightsId is null', () => {
    renderWithIntl(<WeightsManagementComponent weights={mockWeights} selectedWeightsId={null} />);

    // Should show meta table for the last weight
    expect(
      screen.getByText(
        mockWeights[mockWeights.length - 1].weightsMeta.id ?? 'weightsMeta.id not available'
      )
    ).toBeInTheDocument();
  });

  it('handles undefined selectedWeightsId', () => {
    renderWithIntl(
      <WeightsManagementComponent weights={mockWeights} selectedWeightsId={undefined as any} />
    );

    expect(screen.getByTestId('weights-selector')).toBeInTheDocument();
    expect(screen.getByTestId('weights-meta-table')).toBeInTheDocument();
  });

  it('updates meta table when weights prop changes', () => {
    const {rerender} = renderWithIntl(
      <WeightsManagementComponent
        weights={mockWeights}
        selectedWeightsId={mockWeights[0].weightsMeta.id ?? null}
      />
    );

    // Update weights with new data
    const updatedWeights: WeightsProps[] = [
      {
        weightsMeta: {
          id: 'queen-1',
          type: 'queen',
          symmetry: 'symmetric',
          numberOfObservations: 100,
          minNeighbors: 2,
          maxNeighbors: 10,
          meanNeighbors: 4.5,
          medianNeighbors: 4.3,
          pctNoneZero: 0.45
        },
        datasetId: 'dataset-1',
        weights: []
      },
      ...mockWeights.slice(1)
    ];

    rerender(
      <IntlProvider messages={messages} locale="en">
        <WeightsManagementComponent
          weights={updatedWeights as WeightsProps[]}
          selectedWeightsId={updatedWeights[0].weightsMeta.id ?? null}
        />
      </IntlProvider>
    );

    expect(screen.getByText('queen-1')).toBeInTheDocument();
  });
});
