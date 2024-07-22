import {Selector, createSelector} from 'reselect';
import {GeoDaState} from '.';
import {MAP_ID} from '@/constants';
import {getDataContainer} from '@/utils/data-utils';

type StateSelector<R> = Selector<GeoDaState, R>;

export const mainTableNameSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.datasets?.length > 0 ? state.root.datasets[0].fileName : '';

export const mainDataIdSelector: StateSelector<string> = (state: GeoDaState) =>
  state.root.datasets?.length > 0 ? state.root.datasets[0].dataId || '' : '';

export const geodaUIStateSelector: StateSelector<GeoDaState['root']['uiState']> = (
  state: GeoDaState
) => state.root.uiState;

// create a memoized selector to get kepler data container
export const keplerDataContainerSelector = createSelector(
  [
    (state: GeoDaState) => state.root.datasets[0].fileName,
    (state: GeoDaState) => state.keplerGl[MAP_ID].visState.datasets
  ],
  (tableName, datasets) => getDataContainer(tableName, datasets)
);
