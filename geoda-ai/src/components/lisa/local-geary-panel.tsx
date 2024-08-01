import {Tabs, Tab} from '@nextui-org/react';
import {useDispatch} from 'react-redux';
import {localGeary} from 'geoda-wasm';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {runLisaAsync} from '@/actions/lisa-actions';

export function LocalGearyPanel() {
  const dispatch = useDispatch<any>();

  // handle onCreateMap
  const runAnalysis = async ({
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
        type: 'geary',
        layerLabel: 'Local Geary',
        lisaFunction: localGeary,
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
          key="uni-localgeary"
          title={
            <div className="flex items-center space-x-2">
              <span>Univariate</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runAnalysis} />
        </Tab>
        {/* <Tab
          key="multi-localgeary"
          title={
            <div className="flex items-center space-x-2">
              <span>Multivariate</span>
            </div>
          }
        ></Tab> */}
      </Tabs>
    </>
  );
}
