import {vectorFromArray} from 'apache-arrow';

import {arrayBufferToBase64, loadArrowFile} from './file-utils';
import {SavedConfigV1} from '@kepler.gl/schemas';
import {GeoDaState} from '@/store';
import {WeightsProps} from '@/actions';

export type GeoDaProject = {
  fileName: string;
  arrowTable: string;
  keplerConfig: SavedConfigV1['config'];
  geodaConfig: GeoDaState['root'];
};

export async function loadGeoDaProject(geodaFile: File) {
  const geodaFileContent = await geodaFile.text();
  const geodaFileData: GeoDaProject = JSON.parse(geodaFileContent);

  // convert arrowTable from base64 string to ArrayBuffer
  const arrowTableBuffer = Buffer.from(geodaFileData.arrowTable, 'base64').buffer;
  // create a File object from the ArrayBuffer
  const arrowFile = new File([arrowTableBuffer], geodaFileData.fileName);
  // load arrow file
  const {fileName, arrowTable, arrowFormatData} = await loadArrowFile(arrowFile);

  return {
    fileName,
    arrowTable,
    arrowFormatData,
    keplerConfig: geodaFileData.keplerConfig,
    geodaConfig: geodaFileData.geodaConfig
  };
}

function saveWeights(weights: WeightsProps[]) {
  // save the weights.data as base64 string
  const savedWeights = weights.map((w: WeightsProps) => {
    const values = w.weights;
    const offsets: number[] = [];
    // flat the values from number[][] to number[], and get the offsets of each row
    const flatValues = values.reduce((accu, value) => {
      const offset = accu.length;
      offsets.push(offset);
      accu.push(...value);
      return accu;
    }, []);

    return {
      ...w,
      weights: arrayBufferToBase64(new Uint32Array(flatValues).buffer),
      offsets: arrayBufferToBase64(new Uint32Array(offsets).buffer)
    }
  });

  return savedWeights;
}

export function saveGeoDaConfig(state: GeoDaState) {
  // remove the file from the geodaConfig, since it will be reconstructed in open-file-modal
  const {file, ...geodaConfig} = state.root;

  // save the weights as ArrayBuffer in format of base64 string
  const savedWeights = saveWeights(geodaConfig.weights); 

  const outputConfig = {
    ...geodaConfig,
    uiState: {
      ...geodaConfig.uiState,
      showSaveProjectModal: false
    },
    weights: savedWeights
  };


  return outputConfig;
}

export function loadGeoDaConfig(state: SavedGeoDaConfig) {
  // load the weights from base64 string to ArrayBuffer
  const weights = state.weights.map((w: WeightsProps) => {
    const values = vectorFromArray(w.weights);
    const offsets = vectorFromArray(w.offsets);
    const weights = offsets.map((offset, i) => values.slice(offset, offsets[i + 1]));
    return {
      ...w,
      weights
    };
  });

  return {
    ...state,
    weights
  };
}
