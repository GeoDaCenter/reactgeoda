import React, {useMemo}from 'react';
import {useIntl} from 'react-intl';
import {
  Autocomplete,
  AutocompleteItem,
  Tabs,
  Tab,
  Card,
  CardBody,
  Input,
  Slider,
  Checkbox,
  Spacer,
  Button,
  Chip
} from '@nextui-org/react';
import {GeojsonLayer} from '@kepler.gl/layers';
import {getNearestNeighborsFromBinaryGeometries} from 'geoda-wasm';
import {RightPanelContainer} from '../common/right-panel-template';
import {WarningBox} from '../common/warning-box';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {MAP_ID} from '@/constants';
import {getIntegerAndStringFieldNames, getKeplerLayer} from '@/utils/data-utils';

const NO_MAP_LOADED_MESSAGE =
  'Please load a map first before creating and managing spatial weights.';

type WeightsCreationProps = {
  validFieldNames: Array<{label: string; value: string}>;
  keplerLayer: GeojsonLayer;
};

function WeightsCreationComponent({validFieldNames, keplerLayer}: WeightsCreationProps) {
  const [selectedID, setSelectedID] = React.useState<string | null>(null);

  const onSelectIDChange = (key: React.Key) => {
    setSelectedID(key as string);
  };

  const onCreateWeights = async () => {
    console.log('create weights');
    const k = 4;
    const binaryGeometryType = keplerLayer.meta.featureTypes;
    const binaryGeometries = keplerLayer.dataToFeature;
    // @ts-expect-error
    const weights = await getNearestNeighborsFromBinaryGeometries({ k, binaryGeometryType, binaryGeometries });
    console.log(weights);
  };

  return (
    <>
      <div className="flex flex-col gap-2 ">
        <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
          <Autocomplete
            label="Weights ID"
            placeholder="Select ID variable"
            className="max-w"
            radius="sm"
            defaultItems={validFieldNames}
            onSelectionChange={onSelectIDChange}
          >
            {item => <AutocompleteItem key={item.value}>{item.label}</AutocompleteItem>}
          </Autocomplete>
        </div>
        <div className="mt-4 flex w-full flex-col">
          <Tabs aria-label="Options" selectedKey="distance">
            <Tab key="contiguity" title="Contiguity Weight">
              <Card className="rounded">
                <CardBody>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </CardBody>
              </Card>
            </Tab>
            <Tab key="distance" title="Distance Weight">
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-2 ">
                    <div className="space-y-1">
                      <p className="text-small text-default-600">Method:</p>
                    </div>
                    <Tabs aria-label="distance-method">
                      <Tab key="knn" title="K-Nearest neighbors">
                        <Input
                          type="number"
                          label="Number of neighbors:"
                          placeholder="4"
                          defaultValue="4"
                        />
                      </Tab>
                      <Tab key="band" title="Distance band">
                        <Slider
                          label="Specify bandwidth"
                          step={0.01}
                          maxValue={1}
                          minValue={0}
                          defaultValue={0.4}
                          className="max-w-md"
                        />
                        <div className="mt-6 flex flex-row gap-2">
                          <Checkbox className="flex grow" size="sm">
                            Use inverse distance
                          </Checkbox>
                          <Input
                            size="sm"
                            className="flex w-32 shrink"
                            type="number"
                            label="Power:"
                            placeholder="1"
                            defaultValue="1"
                            labelPlacement="outside-left"
                          />
                        </div>
                      </Tab>
                    </Tabs>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
        <Spacer y={8} />
        <Button radius="sm" color="primary" className="bg-rose-900" onClick={onCreateWeights}>
          Create Spatial Weights
        </Button>
      </div>
    </>
  );
}

export function WeightsPanel() {
  const intl = useIntl();
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);
  const visState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID].visState);
  const validFieldNames = useMemo(() => {
    const fieldNames = getIntegerAndStringFieldNames(tableName, visState);
    return fieldNames.map(fieldName => ({label: fieldName, value: fieldName}));
  }, [tableName, visState]);
  const keplerLayer = useMemo(() => {
    const layer = getKeplerLayer(tableName, visState);
    return layer;
  }, [tableName, visState]);

  return (
    <RightPanelContainer
      title={intl.formatMessage({
        id: 'weights.title',
        defaultMessage: 'Spatial Weights'
      })}
      description={intl.formatMessage({
        id: 'weights.description',
        defaultMessage: 'Create and manage spatial weights'
      })}
    >
      {/* {!tableName ? <WarningBox message={NO_MAP_LOADED_MESSAGE} type="warning" /> : <></>} */}
      <>
        <div className="flex w-full flex-col">
          <Tabs aria-label="Options" variant="solid" color="warning" classNames={{}} size="md">
            <Tab
              key="weights-creation"
              title={
                <div className="flex items-center space-x-2">
                  <span>Weights Creation</span>
                </div>
              }
            >
              <Card>
                <CardBody>
                  <WeightsCreationComponent validFieldNames={validFieldNames} keplerLayer={keplerLayer} />
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="weights-management"
              title={
                <div className="flex items-center space-x-2">
                  <span>Weights Management</span>
                  <Chip size="sm" variant="faded">
                    3
                  </Chip>
                </div>
              }
            ></Tab>
          </Tabs>
        </div>
      </>
    </RightPanelContainer>
  );
}
