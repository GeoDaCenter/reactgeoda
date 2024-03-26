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
  TableCell,
  CardHeader
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

// format the number to display 4 decimal places
const formatNumber = (num: number) => num.toFixed(4);

// format dependent variable and independent variables as y ~ x1 + x2 + x3
const formatEquation = (y: string, x: string[]) => `${y} ~ ${x.join(' + ')}`;

// function to print out the REGRESSION DIAGNOSTICS as string, if there is object, it will be printed as key: value and new line
const printRegressionDiagnostics = (diagnostics: any) => {
  return Object.entries(diagnostics)
    .map(([key, value]) => {
      if (typeof value === 'object') {
        // if it is an object, print it as key: value one by one in new line
        return `${key}: ${JSON.stringify(value)}`;
      }
      return `${key}: ${value}`;
    })
    .join('\n');
};

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
              <div className="p-1">
                <div className="flex flex-col gap-4">
                  {regressions.map((regression: RegressionProps) => (
                    <Card key={regression.id} className="p-0">
                      <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                        <p className="text-tiny font-bold uppercase">
                          {regression.data.result.title}
                        </p>
                        <small className="text-default-500">
                          {formatEquation(
                            regression.data.result.dependentVariable,
                            regression.data.result.independentVariables
                          )}
                        </small>
                      </CardHeader>
                      <CardBody>
                        <ScrollShadow className="h-[400px] w-full text-small">
                          <div className="flex w-full flex-col gap-2 rounded-none text-small">
                            <Table className="w-full rounded-none" shadow="none">
                              <TableHeader>
                                <TableColumn>Variable</TableColumn>
                                <TableColumn>Coefficient</TableColumn>
                                <TableColumn>Probability</TableColumn>
                              </TableHeader>
                              <TableBody className="text-small">
                                {regression.data.result['Variable Coefficients'].map(stats => (
                                  <TableRow key={stats.Variable} className="text-small">
                                    <TableCell className="text-small">{stats.Variable}</TableCell>
                                    <TableCell>{formatNumber(stats.Coefficient)}</TableCell>
                                    <TableCell>{formatNumber(stats.Probability)}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                            <p className="text-small font-bold uppercase">Regression Diagnostics</p>
                            <pre className="text-small">
                              {printRegressionDiagnostics(
                                regression.data.result['REGRESSION DIAGNOSTICS']
                              )}
                            </pre>
                          </div>
                        </ScrollShadow>
                      </CardBody>
                    </Card>
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
