import React, {Key, useMemo, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  Tabs,
  Tab,
  Card,
  CardBody,
  Input,
  Slider,
  Checkbox,
  Spacer,
  RadioGroup,
  Radio
} from '@nextui-org/react';
import {Layer} from '@kepler.gl/layers';
import {BinaryGeometryType, getDistanceThresholds} from 'geoda-wasm';
import {useIntl} from 'react-intl';

import {addWeights, setDefaultWeightsId} from '@/actions';
import {WarningBox, WarningType} from '../common/warning-box';
import {
  checkWeightsIdExist,
  createWeights,
  CreateWeightsProps,
  getWeightsId
} from '@/utils/weights-utils';
import {CreateButton} from '../common/create-button';
import {BinaryFeatureCollection} from '@loaders.gl/schema';
import {
  getBinaryGeometryTypeFromLayer,
  getBinaryGeometriesFromLayer
} from '../spatial-operations/spatial-join-utils';
import KeplerTable from '@kepler.gl/table';
import {WeightsProps} from '@/reducers/weights-reducer';

type WeightsCreationProps = {
  validFieldNames?: Array<{label: string; value: string}>;
  keplerLayer: Layer;
  keplerDataset: KeplerTable;
  weightsData: WeightsProps[];
  onWeightsCreated: () => void;
};

export function WeightsCreationComponent({
  keplerLayer,
  keplerDataset,
  weightsData,
  onWeightsCreated
}: WeightsCreationProps) {
  const dispatch = useDispatch<any>();
  const intl = useIntl();

  const [error, setError] = useState<string | null>(null);
  const [weightsType, setWeightsType] = useState<'contiguity' | 'knn' | 'band'>('contiguity');
  const [inputK, setInputK] = useState<number>(4);
  const [contiguityType, setContiguityType] = useState<string>('queen');
  const [orderOfContiguity, setOrderContiguity] = useState<number>(1);
  const [precisionThreshold, setPrecisionThreshold] = useState<number>(0);
  const [includeLowerOrder, setIncludeLowerOrder] = useState<boolean>(false);

  const [minSliderValue, setMinSliderValue] = useState<number>(0);
  const [maxSliderValue, setMaxSliderValue] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);

  const binaryGeometryType: BinaryGeometryType = useMemo(
    () => getBinaryGeometryTypeFromLayer(keplerLayer) as BinaryGeometryType,
    [keplerLayer]
  );

  const binaryGeometries = useMemo(
    () => getBinaryGeometriesFromLayer(keplerLayer, keplerDataset) as BinaryFeatureCollection[],
    [keplerLayer, keplerDataset]
  );

  const datasetId = keplerLayer.config.dataId;

  const isMile = false;

  const onWeightsSelectionChange = async (key: Key) => {
    setWeightsType(key as 'contiguity' | 'knn' | 'band');
    if (key === 'distance' && binaryGeometries && binaryGeometryType) {
      // compute the distanceThreshold
      const {minDistance, maxDistance, maxPairDistance} = await getDistanceThresholds({
        isMile,
        binaryGeometryType,
        // @ts-ignore
        binaryGeometries
      });
      setMinSliderValue(minDistance);
      setSliderValue(maxDistance);
      setMaxSliderValue(maxPairDistance);
    }
  };

  const onSliderValueChange = (value: number | number[]) => {
    setSliderValue(value as number);
  };

  const onContiguityTypeChange = (value: string) => {
    setContiguityType(value);
  };

  const onCreateWeights = async () => {
    setError(null);
    try {
      const weightsProps: CreateWeightsProps = {
        datasetId,
        weightsType,
        contiguityType,
        binaryGeometryType,
        binaryGeometries,
        precisionThreshold,
        orderOfContiguity,
        includeLowerOrder,
        k: inputK,
        distanceThreshold: sliderValue,
        isMile
      };
      const isWeightsIdExist = checkWeightsIdExist(weightsProps, weightsData);
      if (!isWeightsIdExist) {
        const result = await createWeights(weightsProps);
        if (!result) {
          throw new Error('weights type is not supported');
        }
        const {weights, weightsMeta} = result;
        // dispatch action to update redux state state.root.weights
        dispatch(addWeights({weights, weightsMeta, datasetId}));
      }
      // set the default weights id
      dispatch(setDefaultWeightsId(getWeightsId(weightsProps)));
      // run callback after weights created
      onWeightsCreated();
    } catch (e) {
      console.error(e);
      setError(`Create weights error. ${e}`);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 ">
        <div className="mt-4 flex w-full flex-col text-small text-default-600">
          <Tabs
            aria-label="Options"
            onSelectionChange={onWeightsSelectionChange}
            defaultSelectedKey={weightsType || 'contiguity'}
          >
            <Tab
              key="contiguity"
              title={intl.formatMessage({
                id: 'weights.contiguity.title',
                defaultMessage: 'Contiguity Weight'
              })}
            >
              <Card className="rounded">
                <CardBody>
                  <div className="flex flex-col gap-2 ">
                    <RadioGroup
                      label=""
                      size="sm"
                      defaultValue={contiguityType}
                      onValueChange={onContiguityTypeChange}
                    >
                      <Radio value="queen">
                        {intl.formatMessage({
                          id: 'weights.contiguity.queen',
                          defaultMessage: 'Queen contiguity'
                        })}
                      </Radio>
                      <Radio value="rook">
                        {intl.formatMessage({
                          id: 'weights.contiguity.rook',
                          defaultMessage: 'Rook contiguity'
                        })}
                      </Radio>
                    </RadioGroup>
                    <div className="flex flex-row items-center gap-2">
                      <p className="text-small text-default-600 ">
                        {intl.formatMessage({
                          id: 'weights.contiguity.order',
                          defaultMessage: 'Order of contiguity'
                        })}
                      </p>
                      <Input
                        size="sm"
                        type="number"
                        label=""
                        labelPlacement="outside-left"
                        className="w-[120px]"
                        value={`${orderOfContiguity}`}
                        onInput={e => setOrderContiguity(parseInt(e.currentTarget.value))}
                      />
                    </div>
                    <Checkbox
                      size="sm"
                      isSelected={includeLowerOrder}
                      onValueChange={e => setIncludeLowerOrder(e)}
                    >
                      {intl.formatMessage({
                        id: 'weights.meta.incLowerOrder',
                        defaultMessage: 'Include Lower Order'
                      })}
                    </Checkbox>
                    <div className="flex flex-row items-center gap-2">
                      <Checkbox size="sm" className="grow">
                        {intl.formatMessage({
                          id: 'weights.contiguity.precision',
                          defaultMessage: 'Precision threshold'
                        })}
                      </Checkbox>
                      <Input
                        size="sm"
                        type="number"
                        label=""
                        placeholder="0"
                        defaultValue="0"
                        labelPlacement="outside-left"
                        className="w-[120px]"
                        value={`${precisionThreshold}`}
                        onInput={e => setPrecisionThreshold(parseInt(e.currentTarget.value))}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
            <Tab
              key="distance"
              title={intl.formatMessage({
                id: 'weights.distance.title',
                defaultMessage: 'Distance Weight'
              })}
            >
              <Card>
                <CardBody>
                  <div className="flex flex-col gap-2 ">
                    <div className="space-y-1">
                      <p className="text-small text-default-600">
                        {intl.formatMessage({
                          id: 'weights.distance.method',
                          defaultMessage: 'Method:'
                        })}
                      </p>
                    </div>
                    <Tabs aria-label="distance-method" onSelectionChange={onWeightsSelectionChange}>
                      <Tab
                        key="knn"
                        title={intl.formatMessage({
                          id: 'weights.distance.knn',
                          defaultMessage: 'K-Nearest neighbors'
                        })}
                      >
                        <Input
                          type="number"
                          label={intl.formatMessage({
                            id: 'weights.distance.neighbors',
                            defaultMessage: 'Number of neighbors:'
                          })}
                          placeholder="4"
                          defaultValue="4"
                          value={`${inputK}`}
                          onInput={e => setInputK(parseInt(e.currentTarget.value))}
                        />
                      </Tab>
                      <Tab
                        key="band"
                        title={intl.formatMessage({
                          id: 'weights.distance.band',
                          defaultMessage: 'Distance band'
                        })}
                      >
                        <Slider
                          label={intl.formatMessage({
                            id: 'weights.distance.bandwidth',
                            defaultMessage: 'Specify bandwidth'
                          })}
                          step={0.01}
                          maxValue={maxSliderValue}
                          minValue={minSliderValue}
                          defaultValue={sliderValue}
                          formatOptions={{style: 'unit', unit: isMile ? 'mile' : 'kilometer'}}
                          className="max-w-md"
                          onChange={onSliderValueChange}
                        />
                        <div className="mt-6 flex flex-row gap-2">
                          <Checkbox className="flex grow" size="sm">
                            {intl.formatMessage({
                              id: 'weights.distance.inverse',
                              defaultMessage: 'Use inverse distance'
                            })}
                          </Checkbox>
                          <Input
                            size="sm"
                            className="flex w-32 shrink"
                            type="number"
                            label={intl.formatMessage({
                              id: 'weights.distance.power',
                              defaultMessage: 'Power:'
                            })}
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
        {error && <WarningBox type={WarningType.ERROR} message={error} />}
        <Spacer y={8} />
        <CreateButton onClick={onCreateWeights} isDisabled={false}>
          {intl.formatMessage({
            id: 'weights.create.button',
            defaultMessage: 'Create Spatial Weights'
          })}
        </CreateButton>
      </div>
    </>
  );
}
