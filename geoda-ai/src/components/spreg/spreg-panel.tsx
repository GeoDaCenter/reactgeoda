import {useIntl} from 'react-intl';
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
  RadioGroup,
  Radio,
  SharedSelection
} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {Key, useEffect, useState} from 'react';

import {GeoDaState} from '@/store';
import {RightPanelContainer} from '@/components/common/right-panel-template';
import {MultiVariableSelector} from '@/components/common/multivariable-selector';
import {WarningBox, WarningType} from '@/components/common/warning-box';
import {runRegressionAsync, updateRegression} from '@/actions/regression-actions';
import {RegressionReport} from './spreg-report';
import {CreateButton} from '@/components/common/create-button';
import {WeightsSelector} from '@/components/weights/weights-selector';
import {selectWeightsByDataId} from '@/store/selectors';
import {DatasetSelector} from '@/components/common/dataset-selector';
import {VariableSelector} from '@/components/common/variable-selector';
import {RegressionProps} from '@/reducers/regression-reducer';
import {useDatasetFields} from '@/hooks/use-dataset-fields';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before running regression analysis.';

export function SpregPanel() {
  // use intl
  const intl = useIntl();

  // use dispatch
  const dispatch = useDispatch<any>();

  // use custom hook
  const {datasetId, keplerDataset, numericFieldNames} = useDatasetFields();

  // get selectors
  const weights = useSelector(selectWeightsByDataId(datasetId));
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);
  const newRegressionCount = regressions?.filter((reg: any) => reg.isNew).length || 0;

  // useState
  const [selectedDatasetId, setSelectedDatasetId] = useState(datasetId);
  const [showRegressionManagement, setShowRegressionManagement] = useState(newRegressionCount > 0);
  const [yVariable, setYVariable] = useState('');
  const [weightsId, setWeightsId] = useState<string>(
    weights.length > 0 ? weights[weights.length - 1].weightsMeta.id || '' : ''
  );
  const [model, setModel] = useState('classic');
  const [xVariables, setXVariables] = useState<string[]>([]);

  // handle select weights
  const onSelectWeights = (value: SharedSelection) => {
    const id = value.currentKey;
    if (id) {
      setWeightsId(id);
    }
  };

  // handle onRunRegression callback
  const onRunRegression = async () => {
    // dispatch action to run regression and add result to store
    dispatch(
      runRegressionAsync({
        keplerDataset,
        model,
        yVariable,
        xVariables,
        weights: weights.find(w => w.weightsMeta.id === weightsId)
      })
    );
  };

  const onSetYVariable = (variable: string) => {
    setYVariable(variable);
    // exclude Y variable from X variables
  };

  const onTabChange = (key: Key) => {
    if (key === 'regression-creation') {
      setShowRegressionManagement(false);
    } else {
      setShowRegressionManagement(true);
    }
  };

  // monitor state.root.regressions, if regressions.length changed, update the tab title
  useEffect(() => {
    if (newRegressionCount > 0) {
      // reset isNew flag of regressions
      regressions.forEach((reg: any) => {
        if (reg.isNew) {
          dispatch(updateRegression(reg.id, false));
        }
      });
    }
  }, [dispatch, newRegressionCount, regressions]);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'spreg.title',
        defaultMessage: 'Spatial Regression'
      })}
      description={intl.formatMessage({
        id: 'lisa.description',
        defaultMessage: 'Apply spatial regression analysis'
      })}
    >
      {!keplerDataset ? (
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type={WarningType.WARNING} />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="danger"
            classNames={{}}
            size="md"
            selectedKey={showRegressionManagement ? 'regression-management' : 'regression-creation'}
            onSelectionChange={onTabChange}
          >
            <Tab
              key="regression-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Model Configuration</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-4 text-sm">
                    <DatasetSelector
                      datasetId={selectedDatasetId}
                      setDatasetId={setSelectedDatasetId}
                    />
                    <VariableSelector
                      variables={numericFieldNames}
                      setVariable={onSetYVariable}
                      size="sm"
                      label="Select dependent variable (Y)"
                    />
                    <MultiVariableSelector
                      variables={numericFieldNames}
                      excludeVariables={[yVariable]}
                      setVariables={setXVariables}
                      label="Select independent variables (X)"
                      isInvalid={xVariables.length === 0}
                    />
                    <WeightsSelector
                      weights={weights}
                      weightsId={weightsId}
                      onSelectWeights={onSelectWeights}
                    />
                    <RadioGroup
                      label="Select model"
                      size="sm"
                      className="ml-2"
                      value={model}
                      onValueChange={value => {
                        setModel(value);
                      }}
                    >
                      <Radio value="classic" defaultChecked={true}>
                        Classic
                      </Radio>
                      <Radio value="spatial-lag" isDisabled={weights.length === 0}>
                        Spatial Lag
                      </Radio>
                      <Radio value="spatial-error" isDisabled={weights.length === 0}>
                        Spatial Error
                      </Radio>
                    </RadioGroup>
                    <CreateButton
                      onClick={onRunRegression}
                      isDisabled={xVariables.length === 0 || yVariable === ''}
                    >
                      Run Regression
                    </CreateButton>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="regression-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>Regression Results</span>
                  {regressions?.length > 0 && (
                    <Chip size="sm" variant="faded">
                      {regressions.length}
                    </Chip>
                  )}
                </div>
              }
            >
              <div className="p-1">
                <div className="flex h-[400px] w-full flex-col gap-4">
                  {regressions.toReversed().map((regression: RegressionProps) => (
                    <RegressionReport
                      key={regression.id}
                      regression={regression}
                      height={400}
                      width={800}
                    />
                  ))}
                </div>
              </div>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
