import React, {Key, useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
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
import {useIntl} from 'react-intl';

import {
  calculateDistanceThresholdsAsync,
  createWeightsAsync,
  setDistanceUnit,
  setStartWeightsCreation,
  setWeightsCreationError
} from '@/actions';
import {WarningBox, WarningType} from '@/components/common/warning-box';
import {CreateWeightsProps} from '@/utils/weights-utils';
import {CreateButton} from '@/components/common/create-button';
import KeplerTable from '@kepler.gl/table';
import {WeightsProps} from '@/reducers/weights-reducer';
import {GeoDaState} from '@/store';
import {selectGeometryData} from '@/store/selectors';

export type WeightsType = 'contiguity' | 'knn' | 'band';

type WeightsCreationProps = {
  validFieldNames?: Array<{label: string; value: string}>;
  keplerLayer: Layer;
  keplerDataset: KeplerTable;
  weightsData: WeightsProps[];
};

export function WeightsCreationComponent({keplerLayer, keplerDataset}: WeightsCreationProps) {
  const dispatch = useDispatch<any>();
  const intl = useIntl();

  const {weightsCreation, distanceThresholds, distanceUnit} = useSelector(
    (state: GeoDaState) => state.root.uiState.weights
  );

  const {binaryGeometryType, binaryGeometries} = useSelector((state: GeoDaState) =>
    selectGeometryData({state, layer: keplerLayer, dataset: keplerDataset})
  );

  const [weightsType, setWeightsType] = useState<WeightsType>('contiguity');
  const [inputK, setInputK] = useState<number>(4);
  const [contiguityType, setContiguityType] = useState<string>('queen');
  const [orderOfContiguity, setOrderContiguity] = useState<number>(1);
  const [precisionThreshold, setPrecisionThreshold] = useState<number>(0);
  const [includeLowerOrder, setIncludeLowerOrder] = useState<boolean>(false);
  const [sliderValue, setSliderValue] = useState<number>(distanceThresholds.maxDistance);

  // update sliderValue when distanceThresholds change
  useEffect(() => {
    setSliderValue(distanceThresholds.maxDistance);
  }, [distanceThresholds.maxDistance]);

  const onWeightsSelectionChange = (key: Key) => {
    setWeightsType(key as WeightsType);
    if (key === 'distance' && binaryGeometries && binaryGeometryType) {
      dispatch(
        calculateDistanceThresholdsAsync({
          isMile: distanceUnit === 'mile',
          binaryGeometryType,
          binaryGeometries
        })
      );
    }
  };

  const onSliderValueChange = (value: number | number[]) => {
    setSliderValue(value as number);
  };

  const onContiguityTypeChange = (value: string) => {
    setContiguityType(value);
  };

  const onOrderOfContiguityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.currentTarget.value);
    if (value < 1) {
      setOrderContiguity(1);
    } else {
      setOrderContiguity(value);
    }
  };

  const onKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.currentTarget.value);
    if (value < 1) {
      setInputK(1);
    } else {
      setInputK(value);
    }
  };

  const onDistanceUnitChange = (value: string) => {
    dispatch(setDistanceUnit(value as 'mile' | 'kilometer'));
    if (binaryGeometryType && binaryGeometries) {
      dispatch(
        calculateDistanceThresholdsAsync({
          isMile: distanceUnit === 'mile',
          binaryGeometryType,
          binaryGeometries
        })
      );
    }
  };

  const onCreateWeights = async () => {
    if (!binaryGeometryType || !binaryGeometries) {
      dispatch(setWeightsCreationError('weights.error.noGeometry'));
      return;
    }
    dispatch(setStartWeightsCreation(true));

    // wait for 100ms to show the loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    const weightsProps: CreateWeightsProps = {
      datasetId: keplerLayer.config.dataId,
      weightsType,
      contiguityType,
      binaryGeometryType,
      binaryGeometries,
      precisionThreshold,
      orderOfContiguity,
      includeLowerOrder,
      k: inputK,
      distanceThreshold: sliderValue,
      isMile: distanceUnit === 'mile'
    };

    dispatch(createWeightsAsync(weightsProps));
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
                        data-testid="order-of-contiguity"
                        labelPlacement="outside-left"
                        className="w-[120px]"
                        value={`${orderOfContiguity}`}
                        onInput={onOrderOfContiguityChange}
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
                          onInput={onKChange}
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
                          data-testid="distance-band-slider"
                          label={intl.formatMessage({
                            id: 'weights.distance.bandwidth',
                            defaultMessage: 'Specify bandwidth'
                          })}
                          step={0.01}
                          maxValue={distanceThresholds.maxPairDistance}
                          minValue={distanceThresholds.minDistance}
                          value={sliderValue}
                          formatOptions={{
                            style: 'unit',
                            unit: distanceUnit
                          }}
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
                            className="flex w-24 shrink"
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
                    <div className="flex flex-row gap-2">
                      <RadioGroup
                        label="Distance unit"
                        size="sm"
                        orientation="horizontal"
                        defaultValue={distanceUnit}
                        onValueChange={onDistanceUnitChange}
                      >
                        <Radio value="mile">Mile</Radio>
                        <Radio value="kilometer">Kilometer</Radio>
                      </RadioGroup>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Tab>
          </Tabs>
        </div>
        {weightsCreation.error && (
          <WarningBox
            type={WarningType.ERROR}
            message={intl.formatMessage({
              id: weightsCreation.error,
              defaultMessage: `Create weights failed. ${weightsCreation.error}`
            })}
          />
        )}
        <Spacer y={8} />
        <CreateButton
          isRunning={weightsCreation.isRunning}
          onClick={onCreateWeights}
          isDisabled={weightsCreation.isRunning}
        >
          {intl.formatMessage({
            id: 'weights.create.button',
            defaultMessage: 'Create Spatial Weights'
          })}
        </CreateButton>
      </div>
    </>
  );
}
