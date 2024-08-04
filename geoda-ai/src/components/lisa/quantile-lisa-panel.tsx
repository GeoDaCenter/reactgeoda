import {Tabs, Tab, Input} from '@nextui-org/react';
import {useDispatch} from 'react-redux';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {Key, useState} from 'react';
import {runQuantileLisaAsync} from '@/actions/lisa-actions';

export function QuantileLisaPanel() {
  const dispatch = useDispatch<any>();

  const [selectedTab, setSelectedTab] = useState('univariate');

  const onSelectionChange = (tab: Key) => {
    setSelectedTab(tab as string);
  };

  const [kValue, setKValue] = useState('5');
  const onKValueChange = (value: string) => {
    setKValue(value);
  };

  const [quantileValue, setQuantileValue] = useState('1');
  const onQuantileValueChange = (value: string) => {
    setQuantileValue(value);
  };

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

    const k = parseInt(kValue);
    const quantile = parseInt(quantileValue);

    if (k < 2 || k > 100) {
      throw new Error('Number of quantiles must be between 2 and 100');
    }
    if (quantile < 1 || quantile > k) {
      throw new Error('Quantile must be between 1 and number of quantiles (k)');
    }

    dispatch(
      runQuantileLisaAsync({
        type: 'ql',
        layerLabel: 'Quantile LISA',
        dataset,
        weights,
        selectedWeight,
        variable,
        permValue,
        threshold,
        k,
        quantile
      })
    );
  };

  return (
    <>
      <Tabs
        aria-label="Options"
        variant="underlined"
        color="default"
        classNames={{}}
        size="md"
        onSelectionChange={onSelectionChange}
        selectedKey={selectedTab}
      >
        <Tab
          key="univariate"
          title={
            <div className="flex items-center space-x-2">
              <span>Univariate</span>
            </div>
          }
        >
          <div className="mb-4 flex flex-col gap-4">
            <Input
              label="Enter number of quantiles"
              type="number"
              onValueChange={onKValueChange}
              value={kValue}
            />
            <Input
              label="Enter which quantile to use"
              type="number"
              onValueChange={onQuantileValueChange}
              value={quantileValue}
            />
          </div>
          <UnivariateLisaConfig runAnalysis={runAnalysis} />
        </Tab>
      </Tabs>
    </>
  );
}
