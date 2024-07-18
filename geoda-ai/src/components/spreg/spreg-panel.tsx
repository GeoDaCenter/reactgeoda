import {useIntl} from 'react-intl';
import {
  Select,
  SelectItem,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
  RadioGroup,
  Radio
} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {Key, useEffect, useMemo, useState} from 'react';

import {getColumnData, getDataContainer, getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {RightPanelContainer} from '../common/right-panel-template';
import {MultiVariableSelector} from '../common/multivariable-selector';
import {WarningBox, WarningType} from '../common/warning-box';
import {MAP_ID} from '@/constants';
import {addRegression, RegressionProps} from '@/actions/regression-actions';
import {runRegression} from '@/utils/regression-utils';
import {RegressionReport} from './spreg-report';
import {generateRandomId} from '@/utils/ui-utils';
import {CreateButton} from '../common/create-button';
import {WeightsSelector} from '../weights/weights-management';
import {mainTableNameSelector} from '@/store/selectors';

const NO_MAP_LOADED_MESSAGE = 'Please load a map first before running regression analysis.';

export function SpregPanel() {
  const intl = useIntl();
  // use dispatch
  const dispatch = useDispatch();

  // get data from redux store
  const weights = useSelector((state: GeoDaState) => state.root.weights);
  const layer = useSelector((state: GeoDaState) => getLayer(state));
  const regressions = useSelector((state: GeoDaState) => state.root.regressions);
  const newRegressionCount = regressions?.filter((reg: any) => reg.isNew).length || 0;
  const tableName = useSelector(mainTableNameSelector);
  const dataContainer = useSelector((state: GeoDaState) =>
    getDataContainer(tableName, state.keplerGl[MAP_ID].visState.datasets)
  );

  // useState for tab change
  const [showRegressionManagement, setShowRegressionManagement] = useState(newRegressionCount > 0);
  // useState for variable name
  const [yVariable, setYVariable] = useState('');
  const [xVariables, setXVariables] = useState<string[]>([]);
  const [selectedWeight, setSelectedWeight] = useState<string>(
    weights.length > 0 ? weights[weights.length - 1].weightsMeta.id || '' : ''
  );
  const [model, setModel] = useState('classic');

  // get numeric columns from redux store
  const numericColumns = useMemo(() => {
    const fieldNames = getNumericFieldNames(layer);
    return fieldNames;
  }, [layer]);

  // handle variable change
  const onVariableSelectionChange = (value: any) => {
    const selectValue = value.currentKey;
    setYVariable(selectValue);
  };

  // handle select weights
  const onSelectWeights = (id: string) => {
    const selectedW = weights.find(w => w.weightsMeta.id === id);
    setSelectedWeight(selectedW?.weightsMeta.id || '');
  };

  // handle onRunRegression callback
  const onRunRegression = async () => {
    // get data from Y variable
    const yData = getColumnData(yVariable, dataContainer);
    // get data for X variables
    const xData = xVariables.map((variable: string) => getColumnData(variable, dataContainer));
    // get weights data
    const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === selectedWeight);
    const w = selectedWeightData?.weights;
    // run regression analysis
    const regression = await runRegression(model, {
      x: xData,
      y: yData,
      weights: w,
      ...(w ? {weightsId: selectedWeight} : {}),
      xNames: xVariables,
      yName: yVariable,
      datasetName: tableName
    });
    // generate random id
    const id = generateRandomId();
    // dispatch action to create regression and add to store
    dispatch(addRegression({id, type: 'regression', data: regression}));
  };

  const onTabChange = (key: Key) => {
    if (key === 'regression-creation') {
      setShowRegressionManagement(false);
    } else {
      setShowRegressionManagement(true);
    }
  };

  // monitor state.root.regressions, if regressions.length changed, update the tab title
  const regressionsLength = regressions?.length;
  useEffect(() => {
    if (regressionsLength) {
      setShowRegressionManagement(true);
    }
  }, [regressionsLength]);

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
      {numericColumns.length === 0 ? (
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
                    <Select
                      label="Select Dependent Variable"
                      className="max-w"
                      onSelectionChange={onVariableSelectionChange}
                    >
                      {numericColumns.map((col: string) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </Select>
                    <MultiVariableSelector
                      setVariables={setXVariables}
                      label="Select Independent Variables"
                    />
                    <WeightsSelector weights={weights} onSelectWeights={onSelectWeights} />
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
                      <Radio value="lag" isDisabled={weights.length === 0}>
                        Spatial Lag
                      </Radio>
                      <Radio value="error" isDisabled={weights.length === 0}>
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
