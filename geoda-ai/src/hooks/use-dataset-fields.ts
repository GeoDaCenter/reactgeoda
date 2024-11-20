import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {defaultDatasetIdSelector, selectKeplerDataset} from '@/store/selectors';
import {
  getIntegerFieldNamesFromDataset,
  getIntegerAndStringFieldNamesFromDataset,
  getNumericFieldNamesFromDataset,
  getJoinableFieldNameAndTypeFromDataset
} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';

/**
 * Hook to get dataset fields
 * @param selectedDatasetId - the id of the selected dataset, if not provided, the default dataset id will be used
 * @returns
 */
export function useDatasetFields(selectedDatasetId?: string) {
  const defaultDatasetId = useSelector(defaultDatasetIdSelector);
  const keplerDataset = useSelector(selectKeplerDataset(selectedDatasetId || defaultDatasetId));
  const datasetId = keplerDataset?.id || '';

  const numericFieldNames = useMemo(
    () => getNumericFieldNamesFromDataset(keplerDataset),
    [keplerDataset]
  );

  const integerFieldNames = useMemo(
    () => getIntegerFieldNamesFromDataset(keplerDataset),
    [keplerDataset]
  );

  const integerOrStringFieldNames = useMemo(
    () => getIntegerAndStringFieldNamesFromDataset(keplerDataset),
    [keplerDataset]
  );

  const joinableFieldNames = useMemo(
    () => getJoinableFieldNameAndTypeFromDataset(keplerDataset),
    [keplerDataset]
  );

  return {
    datasetId,
    keplerDataset,
    numericFieldNames,
    integerFieldNames,
    integerOrStringFieldNames,
    joinableFieldNames
  };
}

export function useSpatialJoinFields(selectedDatasetId?: string) {
  const keplerDataset = useSelector((state: GeoDaState) =>
    selectedDatasetId ? state.keplerGl[MAP_ID].visState.datasets[selectedDatasetId] : null
  );
  const datasetId = keplerDataset?.id || '';

  const joinableFieldNames = useMemo(
    () => getJoinableFieldNameAndTypeFromDataset(keplerDataset),
    [keplerDataset]
  );

  return {
    datasetId,
    joinableFieldNames
  };
}

export function useSpatialAssignFields(selectedDatasetId?: string) {
  const keplerDataset = useSelector((state: GeoDaState) =>
    selectedDatasetId ? state.keplerGl[MAP_ID].visState.datasets[selectedDatasetId] : null
  );
  const datasetId = keplerDataset?.id || '';

  const allFieldNames = useMemo(
    () => getJoinableFieldNameAndTypeFromDataset(keplerDataset),
    [keplerDataset]
  );

  return {
    datasetId,
    fieldNames: allFieldNames
  };
}
