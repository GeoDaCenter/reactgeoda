import {DatasetProps} from '@/reducers/file-reducer';
import {processDropFiles} from '@/utils/file-utils';
import {addDataToMap} from '@kepler.gl/actions';
import {ProtoDataset} from '@kepler.gl/types';
import {Dispatch} from 'react';
import {UnknownAction} from 'redux';
import {setOpenFileModal, setOpenFileModalError, setOpenFileModalIsLoading} from './ui-actions';
import {GeoDaState} from '@/store';
import {DuckDB} from '@/hooks/use-duckdb';
import {toast} from 'react-toastify';

export enum FILE_ACTIONS {
  ADD_DATASET = 'ADD_DATASET',
  SAVE_PROJECT = 'SAVE_PROJECT',
  ADD_ARROW_TABLE = 'ADD_ARROW_TABLE'
}

export const saveProject = () => ({
  type: FILE_ACTIONS.SAVE_PROJECT
});

export const addDataset = (data: DatasetProps) => ({
  // arrow data
  type: FILE_ACTIONS.ADD_DATASET,
  payload: data
});

export const addArrowTable = ({fileName, arrowTable}: {fileName: string; arrowTable: any}) => ({
  type: FILE_ACTIONS.ADD_ARROW_TABLE,
  payload: {fileName, arrowTable}
});

// thunk action creator
export const loadDroppedFilesAsync =
  (acceptedFiles: File[], isAddingDataset: boolean) =>
  async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    // clear error message
    dispatch(setOpenFileModalError(''));
    // set loading to true to show loading spinner
    dispatch(setOpenFileModalIsLoading(true));
    try {
      const {datasets, keplerConfig, geodaConfig} = await processDropFiles(
        acceptedFiles,
        isAddingDataset
      );
      // prevent adding the same dataset to the project
      const existingDatasets = getState().root.datasets;
      if (existingDatasets.length > 0) {
        // check if dataset in datasets already exists in existingDatasets
        const existingDatasetNames = existingDatasets.map(dataset => dataset.fileName);
        const datasetAlreadyExist = datasets.some(dataset =>
          existingDatasetNames.includes(dataset.fileName)
        );
        if (datasetAlreadyExist) {
          throw new Error('Dataset already exists in the project.');
        }
      }
      // check if there is a shapefile
      const shapefileExists = acceptedFiles.some(file => file.name.endsWith('.shp'));
      const prjFileExists = acceptedFiles.some(file => file.name.endsWith('.prj'));
      const useNoBasemap = shapefileExists && !prjFileExists;
      if (useNoBasemap) {
        // show warning message in open file modal
        toast.warning(
          'Shapefile is dropped without a corresponding .prj file. Basemap has been turned off.'
        );
      }

      const keplerDatasets: ProtoDataset[] = [];
      for (let i = 0; i < datasets.length; i++) {
        const {fileName, arrowTable, arrowFormatData} = datasets[i];
        // add arrowTable to duckdb
        await DuckDB.getInstance().importArrowFile({fileName, arrowTable});
        // append duckdb instance to arrowFormatData
        const keplerDataset = arrowFormatData;
        if (keplerDataset) {
          keplerDatasets.push(keplerDataset);
        }
        // dispatch action to set file data, update redux state state.fileData
        dispatch(addDataset({fileName, dataId: keplerDataset?.info.id, arrowTable}));
      }

      if (keplerDatasets.length > 0) {
        // dispatch addDataToMap action to default kepler.gl instance
        dispatch(
          addDataToMap({
            datasets: keplerDatasets || [],
            options: {centerMap: true},
            ...(useNoBasemap && {config: {mapStyle: {styleType: 'no_map'}}}),
            ...(keplerConfig && {config: keplerConfig})
          })
        );
      }

      if (geodaConfig) {
        // dispatch action to set geoda config, update redux state state.root
        dispatch({type: 'LOAD_PROJECT', payload: geodaConfig});
      }
      // close open file modal
      dispatch(setOpenFileModal(false));
    } catch (e) {
      // show error message in open file modal
      dispatch(setOpenFileModalError((e as Error).message));
    } finally {
      dispatch(setOpenFileModalIsLoading(false));
    }
  };

/**
 * Load project file from URL asynchronously
 * @param projectUrl project file URL
 * @returns It is a thunk function that actions will be dispatched to update the redux state
 */
export const loadProjectUrlAsync =
  (projectUrl: string) => async (dispatch: Dispatch<UnknownAction>, getState: () => GeoDaState) => {
    // clear error message
    dispatch(setOpenFileModalError(''));
    // set loading to true to show loading spinner
    dispatch(setOpenFileModalIsLoading(true));

    try {
      // check if projectUrl is a valid URL
      const url = new URL(projectUrl);
      if (!url) {
        throw new Error('Project URL is not valid');
      }
      // get datasets from state
      const existingDatasets = getState().root.datasets;
      if (existingDatasets.length > 0) {
        throw new Error('Project file cannot be added to the current project.');
      }
      // fetch project file
      const res = await fetch(projectUrl);
      if (!res.ok) {
        dispatch(setOpenFileModalError('Failed to fetch project file'));
        return;
      }
      const data = await res.json();
      // create a File object from the json data
      const file = new File([JSON.stringify(data)], 'project.geoda', {
        type: 'application/json'
      });
      // process dropped files, and return the file name, arrowTable and arrowFormatData
      const {datasets, keplerConfig, geodaConfig} = await processDropFiles([file]);
      for (let i = 0; i < datasets.length; ++i) {
        const {fileName, arrowTable, arrowFormatData} = datasets[i];
        // dispatch addDataToMap action to default kepler.gl instance
        if (arrowFormatData) {
          dispatch(
            addDataToMap({
              datasets: arrowFormatData,
              options: {centerMap: true},
              ...(keplerConfig && {config: keplerConfig})
            })
          );
        }
        // dispatch action to set file data, update redux state state.fileData
        dispatch(addDataset({fileName, arrowTable}));
      }
      // dispatch action to set geoda config, update redux state state.root
      if (geodaConfig) {
        setTimeout(() => {
          dispatch({type: 'LOAD_PROJECT', payload: geodaConfig});
        }, 1000);
      }
      // close open file modal
      dispatch(setOpenFileModal(false));
    } catch (e) {
      // show error message in open file modal
      dispatch(setOpenFileModalError((e as Error).message));
    } finally {
      dispatch(setOpenFileModalIsLoading(false));
    }
  };
