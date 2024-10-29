import {
  CreateRatesMapPayloadProps,
  MAPS_ACTIONS,
  createMap,
  createMapAsync,
  createRatesMapAsync
} from '@/actions/maps-actions';
import {MAP_ID, MappingTypes} from '@/constants';
import {createMapUpdater, createRatesMapUpdater} from '@/reducers/maps-updater';
import {addKeplerColumn} from '@/utils/table-utils';
import {DuckDB} from '@/hooks/use-duckdb';
import {addLayer, addTableColumn} from '@kepler.gl/actions';
import {ColorRange} from '@kepler.gl/constants';
import {RatesOptions} from 'geoda-wasm';
import {Field} from '@kepler.gl/types';

// Mock dependencies
jest.mock('@/reducers/maps-updater', () => ({
  createMapUpdater: jest.fn(),
  createRatesMapUpdater: jest.fn()
}));
jest.mock('@/utils/table-utils', () => ({
  addKeplerColumn: jest.fn()
}));
jest.mock('@kepler.gl/actions', () => ({
  addLayer: jest.fn(),
  addTableColumn: jest.fn()
}));

const mockColorRange: ColorRange = {
  colors: ['#000000', '#000001', '#000002', '#000003', '#000004']
};

describe('Maps Actions', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const payloadofCreateQuantileMap = {
    dataId: 'test-data',
    variable: 'population',
    classficationMethod: MappingTypes.QUANTILE,
    numberOfCategories: 5,
    colorRange: mockColorRange
  };

  describe('Action Creators', () => {
    it('should create an action to create a map', () => {
      const expectedAction = {
        type: MAPS_ACTIONS.CREATE_MAP,
        payload: payloadofCreateQuantileMap
      };

      expect(createMap(payloadofCreateQuantileMap)).toEqual(expectedAction);
    });
  });

  describe('Thunk Actions', () => {
    const mockDispatch = jest.fn();
    const mockGetState = jest.fn();

    describe('createMapAsync', () => {
      beforeEach(() => {
        // mock return value for getState() in thunk action creator
        mockGetState.mockReturnValue({keplerGl: {map: {visState: {datasets: {}}}}});
      });

      it('should dispatch addLayer when map creation is successful', async () => {
        const mockLayer = {
          config: {dataId: 'test-data'}
        };

        (createMapUpdater as jest.Mock).mockResolvedValue(mockLayer);

        await createMapAsync(payloadofCreateQuantileMap)(mockDispatch, mockGetState);

        expect(createMapUpdater).toHaveBeenCalledWith(
          payloadofCreateQuantileMap,
          mockGetState().keplerGl
        );
        expect(mockDispatch).toHaveBeenCalledWith(addLayer(mockLayer, 'test-data'));
      });

      it('should not dispatch addLayer when map creation fails', async () => {
        (createMapUpdater as jest.Mock).mockResolvedValue(null);

        await createMapAsync(payloadofCreateQuantileMap)(mockDispatch, mockGetState);

        expect(createMapUpdater).toHaveBeenCalled();
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });

    describe('createRatesMapAsync', () => {
      const payloadOfCreateRatesMap: CreateRatesMapPayloadProps = {
        dataId: 'test-data',
        method: RatesOptions.RawRates,
        eventVariable: 'crimes',
        baseVariable: 'population',
        classficationMethod: MappingTypes.QUANTILE,
        numberOfCategories: 5,
        colorRange: mockColorRange
      };

      beforeEach(() => {});

      const mockGeoDaState = {
        root: {weights: {}},
        keplerGl: {
          [MAP_ID]: {
            visState: {
              datasets: {
                'test-data': {
                  id: 'test-data',
                  label: 'test-table'
                }
              }
            }
          }
        }
      };
      const mockColumnValues = [1, 2, 3];
      const mockNewField: Field = {
        name: 'rate',
        type: 'real',
        analyzerType: 'string',
        displayName: 'rate',
        format: 'string',
        fieldIdx: 0,
        valueAccessor: () => 0
      };
      const mockNewMapLayer = {
        config: {
          dataId: 'test-data',
          colorField: {name: 'rate'}
        }
      };

      it('should dispatch addTableColumn and addLayer when rates map creation is successful', async () => {
        (createRatesMapUpdater as jest.Mock).mockResolvedValue({
          newLayer: mockNewMapLayer,
          values: mockColumnValues
        });

        mockGetState.mockReturnValue(mockGeoDaState);

        const mockDuckDBInstance = {
          addColumnWithValues: jest.fn().mockResolvedValue(null)
        };
        (DuckDB.getInstance as jest.Mock).mockReturnValue(mockDuckDBInstance);

        (addKeplerColumn as jest.Mock).mockReturnValue({
          newField: mockNewField,
          values: mockColumnValues
        });

        await createRatesMapAsync(payloadOfCreateRatesMap)(mockDispatch, mockGetState);

        expect(mockDuckDBInstance.addColumnWithValues).toHaveBeenCalled();
        expect(mockDuckDBInstance.addColumnWithValues).toHaveBeenCalledWith({
          tableName: 'test-table',
          columnName: 'rate',
          columnValues: mockColumnValues,
          columnType: 'NUMERIC'
        });
        expect(addKeplerColumn).toHaveBeenCalled();
        expect(addKeplerColumn).toHaveBeenCalledWith({
          dataset: mockGeoDaState.keplerGl[MAP_ID].visState.datasets['test-data'],
          newFieldName: 'rate',
          fieldType: 'real',
          columnData: mockColumnValues
        });

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith(
          addTableColumn('test-data', mockNewField, mockColumnValues)
        );
        expect(mockDispatch).toHaveBeenCalledWith(addLayer(mockNewMapLayer, 'test-data'));
      });

      it('should not dispatch actions when rates map creation fails', async () => {
        (createRatesMapUpdater as jest.Mock).mockResolvedValue({
          newLayer: null,
          values: []
        });

        mockGetState.mockReturnValue(mockGeoDaState);
        await createRatesMapAsync(payloadOfCreateRatesMap)(mockDispatch, mockGetState);
        expect(mockDispatch).not.toHaveBeenCalled();
      });
    });
  });
});
