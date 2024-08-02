import {Tabs, Tab} from '@nextui-org/react';
import {useDispatch} from 'react-redux';
import {localMoran} from 'geoda-wasm';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {runLisaAsync} from '@/actions/lisa-actions';

export function LocalMoranPanel() {
  const dispatch = useDispatch<any>();

  // handle onCreateMap
  const runAnalysis = ({
    dataset,
    weights,
    selectedWeight,
    variable,
    permValue,
    threshold
  }: RunAnalysisProps) => {
    if (!dataset) {
      throw new Error('Dataset not found');
    }

    dispatch(
      runLisaAsync({
        type: 'moran',
        layerLabel: 'Local Moran',
        lisaFunction: localMoran,
        dataset,
        weights,
        selectedWeight,
        variable,
        permValue,
        threshold
      })
    );
  };

  return (
    <>
      <Tabs aria-label="Options" variant="underlined" color="default" classNames={{}} size="md">
        <Tab
          key="uni-localmoran"
          title={
            <div className="flex items-center space-x-2">
              <span>Univariate</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runAnalysis} />
        </Tab>
      </Tabs>
    </>
  );
}
