import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {defaultDatasetIdSelector, selectKeplerDataset} from '@/store/selectors';
import {
  getIntegerFieldNamesFromDataset,
  getIntegerAndStringFieldNamesFromDataset,
  getNumericFieldNamesFromDataset
} from '@/utils/data-utils';

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

  return {
    datasetId,
    keplerDataset,
    numericFieldNames,
    integerFieldNames,
    integerOrStringFieldNames
  };
}
