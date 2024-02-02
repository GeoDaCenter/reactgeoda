import {LocalMoranResultType} from 'geoda-wasm';
import {Button} from '@nextui-org/react';
import Typewriter from 'typewriter-effect';
import {useState} from 'react';
import {ALL_FIELD_TYPES} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {KeplerTable} from '@kepler.gl/table';
import {addTableColumn} from '@kepler.gl/actions';

import {CustomMessageProps} from './custom-messages';
import {HeartIcon} from '../icons/heart';
import {UniLocalMoranOutput} from '@/utils/custom-functions';
import {LISA_COLORS, LISA_LABELS, MAP_ID} from '@/constants';
import {createUniqueValuesMap} from '@/utils/mapping-functions';

/**
 * Custom LISA Message
 */
export const CustomLocalMoranMessage = ({props}: {props: CustomMessageProps}) => {
  const [hide, setHide] = useState(false);
  const {key, output, dispatch, geodaState} = props;

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

    // get dataset from kepler.gl if dataset.label === tableName
    const tableName = geodaState.root.file?.rawFileData?.name;
    const datasets: KeplerTable[] = Object.values(geodaState.keplerGl[MAP_ID].visState.datasets);
    const dataset = datasets.find(dataset => dataset.label === tableName);
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
      selectState: {
        tableName: tableName,
        layers: geodaState.keplerGl[MAP_ID].visState.layers
      }
    });
    // hide the button once clicked
    setHide(true);
  };

  return (
    <div className="w-60">
      {/* <WeightsMetaTable weightsMeta={output.data as WeightsMeta} /> */}
      {!hide && (
        <Button
          radius="full"
          className="mt-2 bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-none"
          key={key}
          onClick={onClick}
          startContent={<HeartIcon />}
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
      )}
    </div>
  );
};
