import {LocalMoranResultType} from 'geoda-wasm';
import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {addTableColumn} from '@kepler.gl/actions';

import {CustomMessagePayload} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {UniLocalMoranOutput} from '@/ai/assistant/custom-functions';
import {LISA_COLORS, LISA_LABELS} from '@/constants';
import {createUniqueValuesMap} from '@/utils/mapping-functions';
import {useDispatch, useSelector} from 'react-redux';
import {getDataset, getLayer} from '@/utils/data-utils';
import {GeoDaState} from '@/store';
import {GreenCheckIcon} from '../icons/green-check';

/**
 * Custom LISA Message
 */
export const CustomLocalMoranMessage = ({props}: {props: CustomMessagePayload}) => {
  const dispatch = useDispatch();
  const [hide, setHide] = useState(false);

  const layer = useSelector((state: GeoDaState) => getLayer(state));
  const dataset = useSelector((state: GeoDaState) => getDataset(state));

  const {output} = props;

  const lm = output.data as LocalMoranResultType;
  const {significanceThreshold, variableName} = output.result as UniLocalMoranOutput['result'];

  // handle click event
  const onClick = () => {
    // get cluster values using significant cutoff
    const clusters = lm.pValues.map((p: number, i: number) => {
      if (p > significanceThreshold) {
        return 0;
      }
      return lm.clusters[i];
    });

    // add new column to kepler.gl
    const newFieldName = `lm_${variableName}`;

    if (!dataset) {
      console.error('Dataset not found');
      return;
    }
    const dataContainer = dataset.dataContainer;
    const fieldsLength = dataset.fields.length;

    // create new field
    const newField: Field = {
      id: newFieldName,
      name: newFieldName,
      displayName: newFieldName,
      format: '',
      type: ALL_FIELD_TYPES.real,
      analyzerType: 'FLOAT',
      fieldIdx: fieldsLength,
      valueAccessor: (d: any) => {
        return dataContainer.valueAt(d.index, fieldsLength);
      }
    };
    // Add a new column without data first, so it can avoid error from deduceTypeFromArray()
    dispatch(addTableColumn(dataset.id, newField, clusters));

    // create custom scale map
    createUniqueValuesMap({
      uniqueValues: [0, 1, 2, 3, 4, 5],
      hexColors: LISA_COLORS,
      legendLabels: LISA_LABELS,
      mappingType: 'Local Moran',
      colorFieldName: newFieldName,
      dispatch,
      layer
    });
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      {/* <WeightsMetaTable weightsMeta={output.data as WeightsMeta} /> */}
      <Button
        radius="full"
        className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
        onClick={onClick}
        startContent={hide ? <GreenCheckIcon /> : <HeartIcon />}
        isDisabled={hide}
      >
        <Typewriter
          options={{
            strings: `Click to Create a Local Moran Map`,
            autoStart: true,
            loop: false,
            delay: 10
          }}
        />
      </Button>
    </div>
  );
};
