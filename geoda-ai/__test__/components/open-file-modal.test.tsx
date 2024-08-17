import React, {Dispatch} from 'react';
import {act} from 'react-dom/test-utils';
import * as redux from 'react-redux';
import OpenFileModal from '../../src/components/open-file-modal';
import {useSelector} from 'react-redux';
import {fireEvent} from '@testing-library/react';
import {screen} from '@testing-library/dom';
import '@testing-library/jest-dom';
import {renderWithProviders} from '../test-utils';
import {pointFile} from '../data/samples';
import {loadDroppedFilesAsync} from '@/actions/file-actions';

// mock useDispatch and useSelector
// jest.mock('react-redux', () => {
//   const reactRedux = jest.requireActual('react-redux');
//   return {
//     ...reactRedux,
//     useDispatch: jest.fn(),
//     useSelector: jest.fn()
//   };
// });

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

describe('OpenFileModal', () => {
  // beforeEach(() => {
  //   (useSelector as unknown as jest.Mock).mockReturnValueOnce('true');
  // });
  // afterEach(() => {
  //   (useSelector as unknown as jest.Mock).mockReset();
  // });

  it('renders without crashing', async () => {
    const {queryByText} = renderWithProviders(<OpenFileModal projectUrl={null} />);
    expect(queryByText('Open File')).toBeInTheDocument();
  });

  it('closes the modal when the close button is clicked', () => {
    // const useDispatchSpy = jest.spyOn(redux, 'useDispatch');
    const {store, container, queryByText, getByLabelText} = renderWithProviders(
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

  it('drop file to open file modal', async () => {
    const {store, container, getActionHistoryAsync, queryByTestId} = renderWithProviders(
      <OpenFileModal projectUrl={null} />
    );

    await act(async () => {
      // simulate drop a file to open file modal
      fireEvent.drop(container, {dataTransfer: {files: [pointFile]}});
      expect(store.dispatch).toHaveLength(1);
      (store.dispatch as Dispatch<any>)(loadDroppedFilesAsync([pointFile], false));

      const actionHistory = await getActionHistoryAsync(); // need to wait async thunk (all inner dispatch)
      expect(actionHistory).toHaveLength(6);
      expect(actionHistory[0]).toEqual({ type: 'SET_OPEN_FILE_MODAL_ERROR', payload: '' });
      expect(actionHistory[1]).toEqual({ type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: true });
      // expect(actionHistory[2]).toEqual({ type: 'ADD_DATASET', payload: { fileName: 'point.geojson', dataId: '-vs1sit' } });
      // check the type of actionHistory[2] is 'ADD_DATASET'
      expect((await actionHistory[2]).type).toBe('ADD_DATASET');
      // expect(actionHistory[3]).toEqual({ type: '@@kepler.gl/ADD_DATA_TO_MAP', payload: { datasets: [Array], options: [Object] } });
      // check the type of actionHistory[3] is '@@kepler.gl/ADD_DATA_TO_MAP'
      expect((await actionHistory[3]).type).toBe('@@kepler.gl/ADD_DATA_TO_MAP');
      expect(actionHistory[4]).toEqual({ type: 'SET_OPEN_FILE_MODAL', payload: false });
      expect(actionHistory[5]).toEqual({ type: 'SET_OPEN_FILE_MODAL_IS_LOADING', payload: false });
    });
    // expect the error message to be displayed in the modal
    // expect(queryByTestId('warning-message')).toBeInTheDocument();
  });
});
