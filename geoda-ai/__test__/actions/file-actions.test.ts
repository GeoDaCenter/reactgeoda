import configureMockStore from 'redux-mock-store';
import thunk, {ThunkMiddleware} from 'redux-thunk';
import {AnyAction} from 'redux';
import * as fileActions from '@/actions/file-actions';
import {processDropFiles} from '@/utils/file-utils';
import {DuckDB} from '@/hooks/use-duckdb';
import {addDataToMap} from '@kepler.gl/actions';

jest.mock('@/utils/file-utils');
jest.mock('@/hooks/use-duckdb');
jest.mock('@kepler.gl/actions');

const middlewares = [thunk as ThunkMiddleware<any, AnyAction>];
const mockStore = configureMockStore(middlewares);

describe('File Actions', () => {
  let store: MockStoreEnhanced<GeoDaState, AnyAction>;

  beforeEach(() => {
    store = mockStore({
      root: {
        datasets: []
      }
    });
    jest.clearAllMocks();
  });

  test('saveProject action creator', () => {
    const expectedAction = {
      type: fileActions.FILE_ACTIONS.SAVE_PROJECT
    };
    expect(fileActions.saveProject()).toEqual(expectedAction);
  });

  test('addDataset action creator', () => {
    const data = {fileName: 'test.csv', dataId: '123', arrowTable: {}};
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

  test('loadDroppedFilesAsync - successful load', async () => {
    const mockFiles = [new File([''], 'test.csv')];
    const mockProcessedData = {
      datasets: [{fileName: 'test.csv', arrowTable: {}, arrowFormatData: {info: {id: '123'}}}],
      keplerConfig: {},
      geodaConfig: {}
    };
    (processDropFiles as jest.Mock).mockResolvedValue(mockProcessedData);
    (DuckDB.getInstance().importArrowFile as jest.Mock).mockResolvedValue();
    (addDataToMap as jest.Mock).mockReturnValue({type: 'ADD_DATA_TO_MAP'});

    await store.dispatch(fileActions.loadDroppedFilesAsync(mockFiles, false));

    const actions = store.getActions();
    expect(actions).toContainEqual({type: 'ADD_DATASET', payload: expect.any(Object)});
    expect(actions).toContainEqual({type: 'ADD_DATA_TO_MAP'});
    expect(actions).toContainEqual({type: 'LOAD_PROJECT', payload: expect.any(Object)});
  });

  test('loadDroppedFilesAsync - duplicate dataset', async () => {
    store = mockStore({
      root: {
        datasets: [{fileName: 'test.csv'}]
      }
    });

    const mockFiles = [new File([''], 'test.csv')];
    const mockProcessedData = {
      datasets: [{fileName: 'test.csv', arrowTable: {}, arrowFormatData: {info: {id: '123'}}}]
    };
    (processDropFiles as jest.Mock).mockResolvedValue(mockProcessedData);

    await store.dispatch(fileActions.loadDroppedFilesAsync(mockFiles, false));

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'SET_OPEN_FILE_MODAL_ERROR',
      payload: 'Dataset already exists in the project'
    });
  });

  test('loadProjectUrlAsync - successful load', async () => {
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

    await store.dispatch(fileActions.loadProjectUrlAsync('http://example.com/project.geoda'));

    const actions = store.getActions();
    expect(actions).toContainEqual({type: 'ADD_DATASET', payload: expect.any(Object)});
    expect(actions).toContainEqual({type: 'ADD_DATA_TO_MAP'});
    expect(actions).toContainEqual({type: 'LOAD_PROJECT', payload: expect.any(Object)});
  });

  test('loadProjectUrlAsync - invalid URL', async () => {
    await store.dispatch(fileActions.loadProjectUrlAsync('invalid-url'));

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'SET_OPEN_FILE_MODAL_ERROR',
      payload: 'Project URL is not valid'
    });
  });

  test('loadProjectUrlAsync - fetch failure', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false
    });

    await store.dispatch(fileActions.loadProjectUrlAsync('http://example.com/project.geoda'));

    const actions = store.getActions();
    expect(actions).toContainEqual({
      type: 'SET_OPEN_FILE_MODAL_ERROR',
      payload: 'Failed to fetch project file'
    });
  });
});
