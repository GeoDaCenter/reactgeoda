import React, {Dispatch} from 'react';
import {act} from 'react-dom/test-utils';
import OpenFileModal from '../../src/components/open-file-modal';
import {fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import {renderWithProviders} from '../test-utils';
import {pointCsvFile, pointFile} from '../data/samples';
import testProject from '../data/test.geoda.json';
import {loadDroppedFilesAsync} from '@/actions/file-actions';
import {DuckDB} from '@/hooks/use-duckdb';

describe('OpenFileModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (DuckDB.getInstance().importArrowFile as jest.Mock).mockResolvedValue({});
  });

  it('renders without crashing', async () => {
    const {queryByText} = renderWithProviders(<OpenFileModal projectUrl={null} />);
    expect(queryByText('Open File')).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', () => {
    const {store, queryByText, getByLabelText} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );
    expect(queryByText('Open File')).toBeInTheDocument();

    // find close button
    const closeButton = getByLabelText('Close');

    // simulate click event on close button
    fireEvent.click(closeButton);

    // expect dispatch action to be called with SET_OPEN_FILE_MODAL action type and payload false
    expect(store.dispatch).toHaveBeenCalledWith({type: 'SET_OPEN_FILE_MODAL', payload: false});

    // expect the modal to be closed
    expect(store.getState().root.uiState.openFileModal.showOpenFileModal).toBe(false);
  });

  it('drop geojson file to open file modal', async () => {
    const {store, container, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );

    await act(async () => {
      // simulate drop a file to open file modal
      fireEvent.drop(container, {dataTransfer: {files: [pointFile]}});
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      (store.dispatch as Dispatch<any>)(loadDroppedFilesAsync([pointFile], false));

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(6);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      // expect(actionHistory[2]).toEqual({ type: 'ADD_DATASET', payload: { fileName: 'point.geojson', dataId: '-vs1sit' } });
      // check the type of actionHistory[2] is 'ADD_DATASET'
      expect((await actionHistory[2]).type).toBe('ADD_DATASET');
      // expect(actionHistory[3]).toEqual({ type: '@@kepler.gl/ADD_DATA_TO_MAP', payload: { datasets: [Array], options: [Object] } });
      // check the type of actionHistory[3] is '@@kepler.gl/ADD_DATA_TO_MAP'
      expect((await actionHistory[3]).type).toBe('@@kepler.gl/ADD_DATA_TO_MAP');
      expect(actionHistory[4]).toEqual({type: 'SET_OPEN_FILE_MODAL', payload: false});
      expect(actionHistory[5]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });

  it('drop invalid file to open file modal', async () => {
    const {store, container, getActionHistoryAsync, queryByTestId} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );

    await act(async () => {
      // simulate drop a invalid file to open file modal
      fireEvent.drop(container, {dataTransfer: {files: [new File([''], 'invalid-file.geojson')]}});
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      (store.dispatch as Dispatch<any>)(
        loadDroppedFilesAsync([new File([''], 'invalid-file')], false)
      );

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(4);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      expect(actionHistory[2]).toEqual({
        type: 'SET_OPEN_FILE_MODAL_ERROR',
        payload:
          'No valid loader found (no url provided, MIME type: not provided, first bytes: not available)'
      });
      expect(actionHistory[3]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });

    // expect the error message to be displayed in the modal
    expect(queryByTestId('warning-message')).toBeInTheDocument();
  });

  it('drop csv file to open file modal', async () => {
    const {store, container, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );

    await act(async () => {
      // simulate drop a file to open file modal
      fireEvent.drop(container, {dataTransfer: {files: [pointCsvFile]}});
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      (store.dispatch as Dispatch<any>)(loadDroppedFilesAsync([pointCsvFile], false));

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(6);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      // expect(actionHistory[2]).toEqual({ type: 'ADD_DATASET', payload: { fileName: 'point.geojson', dataId: '-vs1sit' } });
      // check the type of actionHistory[2] is 'ADD_DATASET'
      expect((await actionHistory[2]).type).toBe('ADD_DATASET');
      // expect(actionHistory[3]).toEqual({ type: '@@kepler.gl/ADD_DATA_TO_MAP', payload: { datasets: [Array], options: [Object] } });
      // check the type of actionHistory[3] is '@@kepler.gl/ADD_DATA_TO_MAP'
      expect((await actionHistory[3]).type).toBe('@@kepler.gl/ADD_DATA_TO_MAP');
      expect(actionHistory[4]).toEqual({type: 'SET_OPEN_FILE_MODAL', payload: false});
      expect(actionHistory[5]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });

  it.skip('drop shp file to open file modal', async () => {
    const {store, container, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );

    await act(async () => {
      // simulate drop a file to open file modal
      fireEvent.drop(container, {dataTransfer: {files: [new File([''], 'point.shp')]}});
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      (store.dispatch as Dispatch<any>)(
        loadDroppedFilesAsync([new File([''], 'point.shp')], false)
      );

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(4);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      expect(actionHistory[2]).toEqual({
        type: 'SET_OPEN_FILE_MODAL_ERROR',
        payload: 'Shapefile must have associated .dbf file. Please drop all files.'
      });
      expect(actionHistory[3]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });

  it('drop invalid arrow file to open file modal', async () => {
    const {store, container, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );

    await act(async () => {
      // simulate drop a file to open file modal
      fireEvent.drop(container, {dataTransfer: {files: [new File([''], 'point.arrow')]}});
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      (store.dispatch as Dispatch<any>)(
        loadDroppedFilesAsync([new File([''], 'point.arrow')], false)
      );

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(4);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      expect(actionHistory[2]).toEqual({
        type: 'SET_OPEN_FILE_MODAL_ERROR',
        payload: "Cannot read properties of undefined (reading 'data')"
      });
      expect(actionHistory[3]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });

  it('project url to open file modal', async () => {
    const projectUrl = 'http://localhost:3000/test.geoda.json';

    // simulate the return value from fetch()
    global.fetch = jest.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue(testProject)
        }) as unknown as Promise<Response>
    );

    const {store, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={projectUrl} />
    );

    await act(async () => {
      // the action to handle the project url should be dispatched
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      // (store.dispatch as Dispatch<any>)(loadProjectUrlAsync(projectUrl));

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(4);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      expect(actionHistory[2]).toEqual({
        type: 'SET_OPEN_FILE_MODAL_ERROR',
        payload:
          'Failed to load arrow file. Details: Expected to read 1784835931 metadata bytes, but only read 16.'
      });
      expect(actionHistory[3]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });

  it('invalid project url to open file modal', async () => {
    const projectUrl = 'http://localhost:3000/test.geoda.json';

    // simulate the return value from fetch()
    global.fetch = jest.fn(
      () =>
        Promise.resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({data: 'mocked data'})
        }) as unknown as Promise<Response>
    );

    const {store, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={projectUrl} />
    );

    await act(async () => {
      // the action to handle the project url should be dispatched
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      // (store.dispatch as Dispatch<any>)(loadProjectUrlAsync(projectUrl));

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)

      expect(actionHistory).toHaveLength(4);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      expect(actionHistory[2]).toEqual({
        type: 'SET_OPEN_FILE_MODAL_ERROR',
        payload: 'Invalid GeoDa project file'
      });
      expect(actionHistory[3]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });

  it('project url is not downable', async () => {
    const projectUrl = 'http://localhost:3000/test.geoda.json';

    // simulate the return value from fetch()
    global.fetch = jest.fn(
      () =>
        Promise.resolve({
          ok: false
        }) as unknown as Promise<Response>
    );

    const {store, getActionHistoryAsync} = renderWithProviders(
      <OpenFileModal projectUrl={projectUrl} />
    );

    await act(async () => {
      // the action to handle the project url should be dispatched
      expect(store.dispatch).toHaveLength(1);

      // we need to manually dispatch the action to load the dropped file
      // (store.dispatch as Dispatch<any>)(loadProjectUrlAsync(projectUrl));

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)

      expect(actionHistory).toHaveLength(4);
      expect(actionHistory[0]).toEqual({type: 'SET_OPEN_FILE_MODAL_ERROR', payload: ''});
      expect(actionHistory[1]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true});
      expect(actionHistory[2]).toEqual({
        type: 'SET_OPEN_FILE_MODAL_ERROR',
        payload: 'Failed to fetch project file'
      });
      expect(actionHistory[3]).toEqual({type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false});
    });
  });
});
