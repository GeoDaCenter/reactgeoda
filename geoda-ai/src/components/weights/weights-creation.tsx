import React from 'react';
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
  Button,
  RadioGroup,
  Radio
} from '@nextui-org/react';
import {GeojsonLayer} from '@kepler.gl/layers';
import {
  WeightsMeta,
  getMetaFromWeights,
  getNearestNeighborsFromBinaryGeometries,
  getContiguityNeighborsFromBinaryGeometries
} from 'geoda-wasm';

import {addWeights} from '@/actions';

type WeightsCreationProps = {
  validFieldNames?: Array<{label: string; value: string}>;
  keplerLayer: GeojsonLayer | null;
};

export function WeightsCreationComponent({keplerLayer}: WeightsCreationProps) {
  const dispatch = useDispatch();

  const [weightsType, setWeightsType] = React.useState<string>('contiguity');
  const [inputK, setInputK] = React.useState<number>(4);
  const [contiguityType, setContiguityType] = React.useState<string>('queen');
  const [orderOfContiguity, setOrderContiguity] = React.useState<number>(1);
  const [precisionThreshold, setPrecisionThreshold] = React.useState<number>(0);
  const [includeLowerOrder, setIncludeLowerOrder] = React.useState<boolean>(false);

  const onWeightsSelectionChange = (key: React.Key) => {
    setWeightsType(key as string);
  };

  const onContiguityTypeChange = (value: string) => {
    setContiguityType(value);
  };

  const onCreateWeights = async () => {
    const binaryGeometryType = keplerLayer?.meta.featureTypes;
    const binaryGeometries = keplerLayer?.dataToFeature;
    if (binaryGeometries && binaryGeometryType) {
      if (weightsType === 'contiguity') {
        const isQueen = contiguityType === 'queen';
        const useCentroids = binaryGeometryType.point || binaryGeometryType.line;
        const weights = await getContiguityNeighborsFromBinaryGeometries({
          binaryGeometryType,
          // @ts-ignore
          binaryGeometries,
          isQueen,
          useCentroids,
          precisionThreshold,
          orderOfContiguity,
          includeLowerOrder
        });
        const weightsMeta: WeightsMeta = {
          ...getMetaFromWeights(weights),
          id: `w-${contiguityType}-contiguity-${orderOfContiguity}${
            includeLowerOrder ? '-lower' : ''
          }`,
          type: contiguityType === 'queen' ? 'queen' : 'rook',
          symmetry: 'symmetric',
          order: orderOfContiguity,
          includeLowerOrder,
          threshold: precisionThreshold
        };
        // dispatch action to update redux state state.root.weights
        dispatch(addWeights({weights, weightsMeta}));
      } else if (weightsType === 'distance') {
        const k = inputK;
        const weights = await getNearestNeighborsFromBinaryGeometries({
          k,
          binaryGeometryType,
          // @ts-ignore
          binaryGeometries
        });
        const weightsMeta: WeightsMeta = {
          ...getMetaFromWeights(weights),
          id: `w-${k}-nn`,
          type: 'knn',
          symmetry: 'asymmetric',
          k
        };
        // dispatch action to update redux state state.root.weights
        dispatch(addWeights({weights, weightsMeta}));
      }
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
            <Tab key="contiguity" title="Contiguity Weight">
              <Card className="rounded">
                <CardBody>
                  <div className="flex flex-col gap-2 ">
                    <RadioGroup
                      label=""
                      size="sm"
                      defaultValue={contiguityType}
                      onValueChange={onContiguityTypeChange}
                    >
                      <Radio value="queen">Queen contiguity</Radio>
                      <Radio value="rook">Rook contiguity</Radio>
                    </RadioGroup>
                    <div className="flex flex-row items-center gap-2">
                      <p className="text-small text-default-600 ">Order of contiguity</p>
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
                      Include lower Orders
                    </Checkbox>
                    <div className="flex flex-row items-center gap-2">
                      <Checkbox size="sm" className="grow">
                        Precivion threshold
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
                          value={`${inputK}`}
                          onInput={e => setInputK(parseInt(e.currentTarget.value))}
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
