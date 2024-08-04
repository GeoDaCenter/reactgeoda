import {DatasetProps} from '@/reducers/file-reducer';

export enum FILE_ACTIONS {
  ADD_DATASET = 'ADD_DATASET',
  SAVE_PROJECT = 'SAVE_PROJECT'
}

export const saveProject = () => ({
  type: FILE_ACTIONS.SAVE_PROJECT
});

export const addDataset = (data: DatasetProps) => ({
  // arrow data
  type: FILE_ACTIONS.ADD_DATASET,
  payload: data
});
