import {useIntl} from 'react-intl';
import {
  Select,
  SelectItem,
  Spacer,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
  Chip,
  ScrollShadow,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell
} from '@nextui-org/react';
import {useDispatch, useSelector} from 'react-redux';
import {Key, useMemo, useState} from 'react';

import {getColumnData, getDataContainer, getLayer, getNumericFieldNames} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {RightPanelContainer} from '../common/right-panel-template';
import {MultiVariableSelector} from '../common/multivariable-selector';
import {WarningBox} from '../common/warning-box';
import {MAP_ID} from '@/constants';
import {addRegression, RegressionProps} from '@/actions/regression-actions';
import {runRegression} from '@/utils/regression-utils';

const NO_WEIGHTS_MESSAGE =
  'Please create a spatial weights matrix before running regression analysis.';
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
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
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
  const onSelectWeights = (value: any) => {
    const selectValue = value.currentKey;
    setSelectedWeight(selectValue);
  };

  // handle onRunRegression callback
  const onRunRegression = async () => {
    console.log('Run regression');
    // get data from Y variable
    const yData = getColumnData(yVariable, dataContainer);
    // get data for X variables
    const xData = xVariables.map((variable: string) => getColumnData(variable, dataContainer));
    // get weights data
    const selectedWeightData = weights.find(({weightsMeta}) => weightsMeta.id === selectedWeight);
    if (!selectedWeightData) {
      console.error('Selected weight not found');
      return;
    }
    const w = selectedWeightData.weights;
    // run regression analysis
    const regression = await runRegression({
      x: xData,
      y: yData,
      weights: w,
      weightsId: selectedWeight,
      xNames: xVariables,
      yName: yVariable,
      datasetName: tableName
    });
    // generate random id
    const id = Math.random().toString(36).substring(7);
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
        <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" />
      ) : weights.length === 0 ? (
        <WarningBox message={NO_WEIGHTS_MESSAGE} type="warning" />
      ) : (
        <div className="h-full overflow-y-auto p-4">
          <Tabs
            aria-label="Options"
            variant="solid"
            color="warning"
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
                  <div className="flex flex-col gap-4">
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
                    <Select
                      label="Select Spatial Weights"
                      className="max-w mb-6"
                      onSelectionChange={onSelectWeights}
                      selectedKeys={[
                        selectedWeight ?? weights[weights.length - 1].weightsMeta.id ?? ''
                      ]}
                    >
                      {weights.map(({weightsMeta}, i) => (
                        <SelectItem key={weightsMeta.id ?? i} value={weightsMeta.id}>
                          {weightsMeta.id}
                        </SelectItem>
                      ))}
                    </Select>
                    <Spacer y={8} />
                    <Button
                      onClick={onRunRegression}
                      radius="sm"
                      color="primary"
                      className="bg-rose-900"
                      disabled={xVariables.length === 0 || yVariable === ''}
                    >
                      Run Regression
                    </Button>
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
              <ScrollShadow className="h-[400px] w-[300px]">
                <div className="p-4">
                  <div className="flex flex-col gap-4">
                    {regressions.map((regression: RegressionProps) => (
                      <Card key={regression.id} className="p-4">
                        <CardBody>
                          <div className="flex flex-col gap-2">
                            <Table>
                              <TableHeader>
                                <TableColumn>Variable</TableColumn>
                                <TableColumn>Coefficient</TableColumn>
                                <TableColumn>Probability</TableColumn>
                              </TableHeader>
                              <TableBody>
                                {Object.entries(
                                  regression.data.result['Variable Coefficients']
                                ).map(([variable, stats]) => (
                                  <TableRow key={variable}>
                                    <TableCell>{variable}</TableCell>
                                    <TableCell>{stats.coefficient}</TableCell>
                                    <TableCell>{stats.prob}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollShadow>
            </Tab>
          </Tabs>
        </div>
      )}
    </RightPanelContainer>
  );
}
