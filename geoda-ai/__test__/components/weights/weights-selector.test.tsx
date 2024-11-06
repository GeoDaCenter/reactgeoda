import '@testing-library/jest-dom';
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import {WeightsSelector, WeightsSelectorProps} from '@/components/weights/weights-selector';
import {IntlProvider} from 'react-intl';
import {Provider} from 'react-redux';
import configureStore from 'redux-mock-store';
import {PanelName} from '@/constants';

const mockStore = configureStore([]);

describe('WeightsSelector', () => {
  const mockWeights = [
    {
      weightsMeta: {
        id: 'weight1',
        numberOfObservations: 100,
        minNeighbors: 1,
        maxNeighbors: 5,
        meanNeighbors: 3,
        medianNeighbors: 3,
        type: 'queen' as const,
        pctNoneZero: 0.5
      }
    },
    {
      weightsMeta: {
        id: 'weight2',
        numberOfObservations: 100,
        minNeighbors: 1,
        maxNeighbors: 5,
        meanNeighbors: 3,
        medianNeighbors: 3,
        type: 'queen' as const,
        pctNoneZero: 0.5
      }
    }
  ];

  const defaultProps: WeightsSelectorProps = {
    weights: mockWeights,
    weightsId: 'weight1',
    onSelectWeights: jest.fn(),
    label: 'Test Weights',
    showWarningBox: true
  };

  const renderWithProviders = (props = defaultProps) => {
    const store = mockStore({});
    return render(
      <Provider store={store}>
        <IntlProvider messages={{}} locale="en">
          <WeightsSelector {...props} />
        </IntlProvider>
      </Provider>
    );
  };
  it('renders select dropdown when weights are available', () => {
    renderWithProviders();
    const labels = screen.getAllByText('Test Weights');
    expect(labels[0]).toBeInTheDocument();
  });

  it('renders all weight options in the dropdown', () => {
    renderWithProviders();
    const button = screen.getByRole('button', {name: /weight1 Test Weights/i});
    fireEvent.click(button);

    expect(screen.getByRole('option', {name: 'weight1'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'weight2'})).toBeInTheDocument();
  });

  it('shows warning box when no weights are available', () => {
    renderWithProviders({
      ...defaultProps,
      weights: []
    });

    expect(screen.getByText('No Spatial Weights')).toBeInTheDocument();
  });

  it('does not show warning box when showWarningBox is false', () => {
    renderWithProviders({
      ...defaultProps,
      weights: [],
      showWarningBox: false
    });

    expect(screen.queryByText('No Spatial Weights')).not.toBeInTheDocument();
  });

  it('uses default label when no label prop is provided', () => {
    renderWithProviders({
      ...defaultProps,
      label: undefined
    });

    const labels = screen.getAllByText('Select Spatial Weights');
    expect(labels[0]).toBeInTheDocument();
  });

  it('the last item option will be selected if no weightsId is provided', () => {
    renderWithProviders({
      ...defaultProps,
      weightsId: undefined
    });

    // weight2 should be rendered
    const button = screen.getByRole('button', {name: /weight2 Test Weights/i});
    expect(button).toBeInTheDocument();

    // weight1 should not be rendered
    const button1 = screen.queryByRole('button', {name: /weight1 Test Weights/i});
    expect(button1).not.toBeInTheDocument();
  });

  it('calls onSelectWeights when a weight is selected', () => {
    const onSelectWeights = jest.fn();
    renderWithProviders({
      ...defaultProps,
      onSelectWeights
    });

    const button = screen.getByRole('button', {name: /weight1 Test Weights/i});
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('option', {name: 'weight2'}));

    expect(onSelectWeights).toHaveBeenCalled();
  });

  it('dispatches setPropertyPanel action when warning box is clicked', () => {
    const store = mockStore({});
    render(
      <Provider store={store}>
        <IntlProvider messages={{}} locale="en">
          <WeightsSelector {...defaultProps} weights={[]} />
        </IntlProvider>
      </Provider>
    );

    const warningBox = screen.getByText('No Spatial Weights');
    fireEvent.click(warningBox);

    const actions = store.getActions();
    expect(actions[0].type).toBe('SET_PROPERTY_PANEL');
    expect(actions[0].payload).toBe(PanelName.WEIGHTS);
  });

  describe('special case when weightsMeta.id is not assigned', () => {
    const errorMockWeights = [
      {
        weightsMeta: {
          numberOfObservations: 100,
          minNeighbors: 1,
          maxNeighbors: 5,
          meanNeighbors: 3,
          medianNeighbors: 3,
          type: 'queen' as const,
          pctNoneZero: 0.5
        }
      },
      {
        weightsMeta: {
          id: 'weight2',
          numberOfObservations: 100,
          minNeighbors: 1,
          maxNeighbors: 5,
          meanNeighbors: 3,
          medianNeighbors: 3,
          type: 'queen' as const,
          pctNoneZero: 0.5
        }
      }
    ];

    it('the key of select options will be the index of weights if weightsMeta.id is not assigned', () => {
      renderWithProviders({
        weights: errorMockWeights,
        weightsId: 'weight1',
        onSelectWeights: jest.fn(),
        label: 'Test Weights',
        showWarningBox: true
      });

      // access the hidden select directly
      const hiddenSelect = screen.getByTestId('hidden-select-container').querySelector('select');
      expect(hiddenSelect?.options[1].value).toBe('0');
      expect(hiddenSelect?.options[2].value).toBe('weight2');
    });
  });
});
