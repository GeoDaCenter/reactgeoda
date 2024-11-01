import {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {defaultDatasetIdSelector, selectKeplerDataset} from '@/store/selectors';
import {getNumericFieldNamesFromDataset} from '@/utils/data-utils';

export function useDatasetFields() {
  const defaultDatasetId = useSelector(defaultDatasetIdSelector);
  const keplerDataset = useSelector(selectKeplerDataset(defaultDatasetId));
  const datasetId = keplerDataset?.id || '';

  const numericFieldNames = useMemo(
    () => getNumericFieldNamesFromDataset(keplerDataset),
    [keplerDataset]
  );

  return {
    datasetId,
    keplerDataset,
    numericFieldNames
  };
}