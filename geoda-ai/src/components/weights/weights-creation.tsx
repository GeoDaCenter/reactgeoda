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
  Button
} from '@nextui-org/react';
import {GeojsonLayer} from '@kepler.gl/layers';
import {WeightsMeta, getMetaFromWeights, getNearestNeighborsFromBinaryGeometries} from 'geoda-wasm';

import {addWeights} from '@/actions';

type WeightsCreationProps = {
  validFieldNames?: Array<{label: string; value: string}>;
  keplerLayer: GeojsonLayer | null;
  afterCreateWeights: () => void;
};

export function WeightsCreationComponent({keplerLayer, afterCreateWeights}: WeightsCreationProps) {
  const dispatch = useDispatch();

  // const [selectedID, setSelectedID] = React.useState<string | null>(null);
  const [inputK, setInputK] = React.useState<number>(4);

  // const onSelectIDChange = (key: React.Key) => {
  // setSelectedID(key as string);
  // };

  const onCreateWeights = async () => {
    console.log('create weights');
    const k = inputK;
    const binaryGeometryType = keplerLayer?.meta.featureTypes;
    const binaryGeometries = keplerLayer?.dataToFeature;
    if (binaryGeometries && binaryGeometryType) {
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
      // dispatch action to update redux state state.root.file.weights
      dispatch(addWeights({weights, weightsMeta}));
      afterCreateWeights();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 ">
        {/* <div className="flex w-full flex-wrap gap-4 md:flex-nowrap">
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
        </div> */}
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
