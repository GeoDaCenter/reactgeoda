import * as fileActions from '@/actions/file-actions';
import {processDropFiles} from '@/utils/file-utils';
import {DuckDB} from '@/hooks/use-duckdb';
import {addDataToMap} from '@kepler.gl/actions';
import {configureTestStore} from '../test-utils';
import {Table as ArrowTable} from 'apache-arrow';
import {Dispatch} from 'react';

// mock duckdb module
jest.mock('../../src/hooks/use-duckdb', () => {
  return {
    DuckDB: {
      getInstance: jest.fn(() => ({
        initDuckDB: jest.fn(),
        importArrowFile: jest.fn()
      }))
    }
  };
});

// Add this mock before the describe block
jest.mock('@/utils/file-utils', () => ({
  processDropFiles: jest.fn()
}));

describe('File Actions', () => {
  const {store, reduxThunkTester} = configureTestStore();

  beforeEach(() => {
    jest.clearAllMocks();
    store.getState().root.datasets = [];
  });

  test('saveProject action creator', () => {
    const expectedAction = {
      type: fileActions.FILE_ACTIONS.SAVE_PROJECT
    };
    expect(fileActions.saveProject()).toEqual(expectedAction);
  });

  test('addDataset action creator', () => {
    const data = {
      fileName: 'test.csv',
      dataId: '123',
      arrowTable: new ArrowTable()
    };
    const expectedAction = {
      type: fileActions.FILE_ACTIONS.ADD_DATASET,
      payload: data
    };
    expect(fileActions.addDataset(data)).toEqual(expectedAction);
  });

  test('addArrowTable action creator', () => {
    const data = {fileName: 'test.arrow', arrowTable: {}};
    const expectedAction = {
      type: fileActions.FILE_ACTIONS.ADD_ARROW_TABLE,
      payload: data
    };
    expect(fileActions.addArrowTable(data)).toEqual(expectedAction);
  });

  test.skip('loadDroppedFilesAsync - successful load', async () => {
    const mockFiles = [new File([''], 'test.csv')];
    const mockProcessedData = {
      datasets: [{fileName: 'test.csv', arrowTable: {}, arrowFormatData: {info: {id: '123'}}}],
      keplerConfig: {},
      geodaConfig: {}
    };
    (processDropFiles as jest.Mock).mockResolvedValue(mockProcessedData);
    (DuckDB.getInstance().importArrowFile as jest.Mock).mockResolvedValue({});
    // (addDataToMap as jest.Mock).mockReturnValue({type: 'ADD_DATA_TO_MAP'});

    (store.dispatch as Dispatch<any>)(fileActions.loadDroppedFilesAsync(mockFiles, false));

    const actionHistory = await reduxThunkTester.getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
    expect(actionHistory).toContainEqual({type: 'ADD_DATASET', payload: expect.any(Object)});
    expect(actionHistory).toContainEqual({type: '@@kepler.gl/ADD_DATA_TO_MAP'}); // Updated this line
    expect(actionHistory).toContainEqual({type: 'LOAD_PROJECT', payload: expect.any(Object)});
  });

  test('loadDroppedFilesAsync - duplicate dataset', async () => {
    store.getState().root.datasets = [{fileName: 'test.csv', arrowTable: new ArrowTable()}];

    const mockFiles = [new File([''], 'test.csv')];
    const mockProcessedData = {
      datasets: [{fileName: 'test.csv', arrowTable: {}, arrowFormatData: {info: {id: '123'}}}]
    };
    (processDropFiles as jest.Mock).mockResolvedValue(mockProcessedData);

    (store.dispatch as Dispatch<any>)(fileActions.loadDroppedFilesAsync(mockFiles, false));

    const actionHistory = await reduxThunkTester.getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
    expect(actionHistory).toContainEqual({
      type: 'SET_OPEN_FILE_MODAL_ERROR',
      payload: 'Dataset already exists in the project'
    });
  });

  test.skip('loadProjectUrlAsync - successful load', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({data: 'mocked project data'})
    });

    const mockProcessedData = {
      datasets: [{fileName: 'project.geoda', arrowTable: {}, arrowFormatData: {info: {id: '123'}}}],
      keplerConfig: {},
      geodaConfig: {}
    };
    (processDropFiles as jest.Mock).mockResolvedValue(mockProcessedData);
    (addDataToMap as jest.Mock).mockReturnValue({type: 'ADD_DATA_TO_MAP'});

    (store.dispatch as Dispatch<any>)(
      fileActions.loadProjectUrlAsync('http://example.com/project.geoda')
    );

    const actionHistory = await reduxThunkTester.getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
    expect(actionHistory).toContainEqual({type: 'ADD_DATASET', payload: expect.any(Object)});
    expect(actionHistory).toContainEqual({type: 'ADD_DATA_TO_MAP'});
    expect(actionHistory).toContainEqual({type: 'LOAD_PROJECT', payload: expect.any(Object)});
  });

  test('loadProjectUrlAsync - invalid URL', async () => {
    (store.dispatch as Dispatch<any>)(fileActions.loadProjectUrlAsync('invalid-url'));

    const actionHistory = await reduxThunkTester.getActionHistoryAsync();
    expect(actionHistory).toContainEqual({
      type: 'SET_OPEN_FILE_MODAL_ERROR',
      payload: 'Invalid URL: invalid-url'
    });
  });

  test('loadProjectUrlAsync - fetch failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false
    });

    (store.dispatch as Dispatch<any>)(
      fileActions.loadProjectUrlAsync('http://example.com/project.geoda')
    );

    const actionHistory = await reduxThunkTester.getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
    expect(actionHistory).toContainEqual({
      type: 'SET_OPEN_FILE_MODAL_ERROR',
      payload: 'Failed to fetch project file'
    });
  });
});
