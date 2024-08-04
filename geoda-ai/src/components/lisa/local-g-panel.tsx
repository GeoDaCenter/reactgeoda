import {Tabs, Tab} from '@nextui-org/react';
import {useDispatch} from 'react-redux';
import {localG, localGStar} from 'geoda-wasm';
import {RunAnalysisProps, UnivariateLisaConfig} from './univariate-lisa-config';
import {Key, useState} from 'react';
import {runLisaAsync} from '@/actions/lisa-actions';

export function LocalGPanel() {
  const dispatch = useDispatch<any>();

  const [selectedTab, setSelectedTab] = useState('uni-localg');

  const onSelectionChange = (tab: Key) => {
    setSelectedTab(tab as string);
  };

  // handle onCreateMap
  const runLocalG = ({
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
    const isGStar = selectedTab === 'uni-localgstart';

    dispatch(
      runLisaAsync({
        type: isGStar ? 'gstar' : 'g',
        layerLabel: isGStar ? 'Local G*' : 'Local G',
        lisaFunction: isGStar ? localGStar : localG,
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
          key="uni-localg"
          title={
            <div className="flex items-center space-x-2">
              <span>Getis-Ord G</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runLocalG} />
        </Tab>
        <Tab
          key="uni-localgstart"
          title={
            <div className="flex items-center space-x-2">
              <span>Getis-Ord G*</span>
            </div>
          }
        >
          <UnivariateLisaConfig runAnalysis={runLocalG} />
        </Tab>
      </Tabs>
    </>
  );
}
