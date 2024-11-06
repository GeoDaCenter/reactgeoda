import '@testing-library/jest-dom';
import React from 'react';
import {render, fireEvent, screen, waitFor} from '@testing-library/react';
import {Provider} from 'react-redux';
import {IntlProvider} from 'react-intl';
import configureStore from 'redux-mock-store';
import {WeightsCreationComponent} from '@/components/weights/weights-creation';
import {addWeights, setDefaultWeightsId} from '@/actions';
import * as weightsUtils from '@/utils/weights-utils';
import messages from '@/translations/en.json';
import {Layer} from '@kepler.gl/layers';
import {KeplerTable} from '@kepler.gl/table';
import * as spatialJoinUtils from '@/components/spatial-operations/spatial-join-utils';

// Mock the dependencies
jest.mock('@/utils/weights-utils');
const mockStore = configureStore([]);

// Mock functions
// getBinaryGeometryTypeFromLayer
jest.mock('@/components/spatial-operations/spatial-join-utils', () => ({
  getBinaryGeometryTypeFromLayer: jest.fn(),
  getBinaryGeometriesFromLayer: jest.fn()
}));

describe('WeightsCreationComponent', () => {
  let store: any;
  const mockOnWeightsCreated = jest.fn();

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
    store = mockStore({});
    store.dispatch = jest.fn();
    jest.clearAllMocks();

    // mock function returns
    (spatialJoinUtils.getBinaryGeometryTypeFromLayer as jest.Mock).mockReturnValue('point');
    (spatialJoinUtils.getBinaryGeometriesFromLayer as jest.Mock).mockReturnValue([]);
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <IntlProvider messages={messages} locale="en">
          <WeightsCreationComponent {...defaultProps} {...props} />
        </IntlProvider>
      </Provider>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Contiguity Weight')).toBeInTheDocument();
  });

  it('handles contiguity weight creation', async () => {
    const mockWeightsResult = {
      weights: {},
      weightsMeta: {}
    };
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

    renderComponent();

    // Click create button
    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      // Verify createWeights was called with correct params
      expect(weightsUtils.createWeights).toHaveBeenCalledWith(
        expect.objectContaining({
          weightsType: 'contiguity',
          contiguityType: 'queen',
          datasetId: 'test-dataset'
        })
      );

      // Update expectations to match actual dispatch calls
      expect(store.dispatch).toHaveBeenCalledWith({
        type: 'ADD_WEIGHTS',
        payload: expect.objectContaining({
          datasetId: 'test-dataset',
          weights: expect.any(Object),
          weightsMeta: expect.any(Object)
        })
      });
      expect(store.dispatch).toHaveBeenCalledWith({
        type: 'SET_DEFAULT_WEIGHTS_ID',
        payload: expect.any(String)
      });

      expect(mockOnWeightsCreated).toHaveBeenCalled();
    });
  });

  it('handles KNN weight creation', async () => {
    const mockWeightsResult = {
      weights: {},
      weightsMeta: {}
    };
    (weightsUtils.createWeights as jest.Mock).mockResolvedValue(mockWeightsResult);
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(false);

    renderComponent();

    // Switch to KNN tab
    const knnTab = screen.getByText('K-Nearest neighbors');
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
    const mockWeightsResult = {
      weights: {},
      weightsMeta: {}
    };
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

  it('displays error when weights creation fails', async () => {
    (weightsUtils.createWeights as jest.Mock).mockRejectedValue(new Error('Creation failed'));

    renderComponent();

    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Create weights error.')).toBeInTheDocument();
    });
  });

  it('handles existing weights ID', async () => {
    (weightsUtils.checkWeightsIdExist as jest.Mock).mockReturnValue(true);

    renderComponent();

    const createButton = screen.getByText('Create Spatial Weights');
    fireEvent.click(createButton);

    await waitFor(() => {
      // Should still set default weights ID and call callback
      expect(store.dispatch).toHaveBeenCalledWith(setDefaultWeightsId(expect.any(String)));
      expect(mockOnWeightsCreated).toHaveBeenCalled();
      // But should not create new weights
      expect(weightsUtils.createWeights).not.toHaveBeenCalled();
    });
  });
});
