import '@testing-library/jest-dom';
import React from 'react';
import {fireEvent, screen, waitFor} from '@testing-library/react';
import {useSelector} from 'react-redux';
import configureStore from 'redux-mock-store';
import {WeightsCreationComponent} from '@/components/weights/weights-creation';
import * as weightsUtils from '@/utils/weights-utils';
import {Layer} from '@kepler.gl/layers';
import {KeplerTable} from '@kepler.gl/table';
import {renderWithProviders} from '../../test-utils';

// Mock the dependencies
jest.mock('@/utils/weights-utils');
const mockStore = configureStore([]);

// Mock useSelector hooks
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
  // useDispatch: jest.fn()
}));

describe('WeightsCreationComponent', () => {
  let store: any;
  const mockOnWeightsCreated = jest.fn();

  const mockWeightsResult = {
    weights: {},
    weightsMeta: {}
  };

  const defaultProps = {
    keplerLayer: {
      id: 'test-layer',
      type: 'geojson',
      config: {
        dataId: 'test-dataset'
      }
    } as Layer,
    keplerDataset: {
      id: 'test-dataset',
      label: 'Test Dataset',
      color: [0, 0, 0],
      fields: [],
      allData: [],
      dataContainer: {
        columns: {},
        numRows: 0
      },
      allIndexes: [],
      filteredIndex: [],
      filteredIndexForDomain: [],
      fieldPairs: [],
      gpuFilter: {},
      fieldsToShow: {},
      columnPairs: [],
      columns: {},
      dataId: 'test-dataset'
    } as unknown as KeplerTable,
    weightsData: [],
    onWeightsCreated: mockOnWeightsCreated
  };

  beforeEach(() => {
    jest.clearAllMocks();

    store = mockStore({});
    store.dispatch = jest.fn();

    // mock useSelector
    (useSelector as unknown as jest.Mock).mockImplementation(selector => {
      if (selector.toString().includes('state.root.uiState.weights')) {
        return {
          weightsCreation: {
            isRunning: false,
            error: null
          },
          distanceThresholds: {
            maxPairDistance: 100,
            minDistance: 0,
            maxDistance: 50
          }
        };
      }
      // second useSelector call
      return {
        binaryGeometryType: 'point',
        binaryGeometries: []
      };
    });
  });

  const renderComponent = (props = {}) => {
    return renderWithProviders(<WeightsCreationComponent {...defaultProps} {...props} />);
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Contiguity Weight')).toBeInTheDocument();
  });

  it('handles contiguity weight creation', async () => {
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);
    (weightsUtils.getWeightsId as jest.Mock).mockReturnValue('w-id');

    const {getActionHistoryAsync} = renderComponent();

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)

    expect(actionHistory).toHaveLength(5);
    expect(actionHistory[0]).toEqual({type: 'SET_START_WEIGHTS_CREATION', payload: true});
    expect(actionHistory[1]).toEqual({
      type: 'ADD_WEIGHTS',
      payload: {
        datasetId: 'test-dataset',
        weights: {},
        weightsMeta: {}
      }
    });
    expect(actionHistory[2]).toEqual({type: 'SET_DEFAULT_WEIGHTS_ID', payload: 'w-id'});
    expect(actionHistory[3]).toEqual({type: 'SET_SHOW_WEIGHTS_PANEL', payload: true});
    expect(actionHistory[4]).toEqual({type: 'SET_START_WEIGHTS_CREATION', payload: false});
  });

  it('create weights error', async () => {
    (weightsUtils.createWeights as jest.Mock).mockRejectedValue(
      new Error('weights.error.typeNotSupported')
    );

    const {getActionHistoryAsync} = renderComponent();

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)

    expect(actionHistory).toHaveLength(3);
    expect(actionHistory[0]).toEqual({type: 'SET_START_WEIGHTS_CREATION', payload: true});
    expect(actionHistory[1]).toEqual({
      type: 'SET_WEIGHTS_CREATION_ERROR',
      payload: 'weights.error.typeNotSupported'
    });
    expect(actionHistory[2]).toEqual({type: 'SET_START_WEIGHTS_CREATION', payload: false});
  });

  it('weights error message', async () => {
    (useSelector as unknown as jest.Mock).mockImplementation(selector => {
      if (selector.toString().includes('state.root.uiState.weights')) {
        return {
          weightsCreation: {
            isRunning: false,
            error: 'weights.error.typeNotSupported'
          },
          distanceThresholds: {
            maxPairDistance: 100,
            minDistance: 0,
            maxDistance: 50
          }
        };
      }
      // second useSelector call
      return {
        binaryGeometryType: 'point',
        binaryGeometries: []
      };
    });
    renderComponent();
    expect(
      screen.getByText('Create weights failed. weights.error.typeNotSupported')
    ).toBeInTheDocument();
  });

  it('handles KNN weight creation', async () => {
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

    renderComponent();

    // Switch to KNN tab
    const knnTab = screen.getByText('Distance Weight');
    fireEvent.click(knnTab);

    // Change K value
    const kInput = screen.getByDisplayValue('4');
    fireEvent.input(kInput, {target: {value: '6'}});

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(
        expect.objectContaining({
          weightsType: 'knn',
          k: 6,
          datasetId: 'test-dataset'
        })
      );
    });
  });

  it('handles distance band weight creation', async () => {
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

    renderComponent();

    // Switch to distance band tab
    const distanceTab = screen.getByText('Distance Weight');
    fireEvent.click(distanceTab);
    const bandTab = screen.getByText('Distance band');
    fireEvent.click(bandTab);

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(
        expect.objectContaining({
          weightsType: 'band',
          datasetId: 'test-dataset'
        })
      );
    });
  });

  it('handles existing weights ID', async () => {
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(true);

    const {getActionHistoryAsync} = renderComponent();

    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    const actionHistory = await getActionHistoryAsync();

    expect(actionHistory).toHaveLength(4);
    expect(actionHistory[0]).toEqual({type: 'SET_START_WEIGHTS_CREATION', payload: true});
    expect(actionHistory[1]).toEqual({
      type: 'SET_DEFAULT_WEIGHTS_ID',
      payload: 'w-id'
    });
    expect(actionHistory[2]).toEqual({type: 'SET_SHOW_WEIGHTS_PANEL', payload: true});
    expect(actionHistory[3]).toEqual({type: 'SET_START_WEIGHTS_CREATION', payload: false});

    expect(weightsUtils.checkWeightsIdExist).toHaveBeenCalled();
    expect(weightsUtils.createWeights).not.toHaveBeenCalled();
  });

  // it('handles kernel weight creation', async () => {
  //   const mockWeightsResult = {
  //     weights: {},
  //     weightsMeta: {}
  //   };
  //   (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
  //   (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

  //   renderComponent();

  //   // Switch to distance weight tab and then kernel tab
  //   const distanceTab = screen.getByText('Distance Weight');
  //   fireEvent.click(distanceTab);
  //   const kernelTab = screen.getByText('Kernel');
  //   fireEvent.click(kernelTab);

  //   // Change kernel function
  //   const kernelSelect = screen.getByLabelText('Kernel function');
  //   fireEvent.change(kernelSelect, {target: {value: 'gaussian'}});

  //   // Click create button
  //   const createButton = screen.getByText('Create Spatial Weights');
  //   fireEvent.click(createButton);

  //   await waitFor(() => {
  //     expect(weightsUtils.createWeights).toHaveBeenCalledWith(
  //       expect.objectContaining({
  //         weightsType: 'kernel',
  //         kernelFunction: 'gaussian',
  //         datasetId: 'test-dataset'
  //       })
  //     );
  //   });
  // });

  it('handles contiguity order changes', async () => {
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

    renderComponent();

    // Find and change the order input using a different query
    const orderInput = screen.getByTestId('order-of-contiguity');
    fireEvent.input(orderInput, {target: {value: '2'}});

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(
        expect.objectContaining({
          orderOfContiguity: 2,
          weightsType: 'contiguity'
        })
      );
    });
  });

  it('handles distance band threshold changes', async () => {
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

    renderComponent();

    // Switch to distance band tab
    const distanceTab = screen.getByText('Distance Weight');
    fireEvent.click(distanceTab);
    const bandTab = screen.getByText('Distance band');
    fireEvent.click(bandTab);

    // Change threshold value
    const slider = screen.getByTestId('distance-band-slider');
    // get input element from slider
    const sliderInput = slider.querySelector('input');
    if (!sliderInput) throw new Error('Slider input not found');

    // fire change event
    fireEvent.change(sliderInput, {target: {value: '20'}});

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(
        expect.objectContaining({
          weightsType: 'band',
          distanceThreshold: 20,
          datasetId: 'test-dataset'
        })
      );
    });
  });

  it.skip('validates input fields before creation', async () => {
    renderComponent();

    // Switch to KNN tab
    const knnTab = screen.getByText('K-Nearest neighbors');
    fireEvent.click(knnTab);

    // Set invalid K value
    const kInput = screen.getByDisplayValue('4');
    fireEvent.input(kInput, {target: {value: '-1'}});

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Invalid K value/i)).toBeInTheDocument();
      expect(weightsUtils.createWeights).not.toHaveBeenCalled();
    });
  });

  it.skip('handles row standardization toggle', async () => {
    renderComponent();

    // Find and click row standardization checkbox
    const standardizeCheckbox = screen.getByLabelText('Row standardization');
    fireEvent.click(standardizeCheckbox);

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(
        expect.objectContaining({
          weightsType: 'contiguity',
          rowStandardize: true,
          datasetId: 'test-dataset'
        })
      );
    });
  });

  it.skip('disables create button while processing', async () => {
    const mockWeightsResult = {
      weights: {},
      weightsMeta: {}
    };
    (weightsUtils.createWeights as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(mockWeightsResult), 100))
    );

    renderComponent();

    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    // Button should be disabled immediately after click
    expect(createButton).toBeDisabled();

    // Wait for processing to complete
    await waitFor(() => {
      expect(createButton).not.toBeDisabled();
    });
  });
});
