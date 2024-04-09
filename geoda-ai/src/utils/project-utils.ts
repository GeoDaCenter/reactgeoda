import {arrayBufferToBase64, base64ToArrayBuffer, loadArrowFile} from './file-utils';
import {SavedConfigV1} from '@kepler.gl/schemas';
import {GeoDaState} from '@/store';
import {WeightsProps} from '@/actions';
import {WeightsMeta} from 'geoda-wasm';

type SavedWeightsProps = {
  weightsMeta: WeightsMeta;
  weights: string;
  offsets: string;
  isNew?: boolean;
};

export type LoadedGeoDaConfig = {
  ai: GeoDaState['root']['ai'];
  uiState: GeoDaState['root']['uiState'];
  weights: WeightsProps[];
  plots: GeoDaState['root']['plots'];
  regressions: GeoDaState['root']['regressions'];
  dashboard: GeoDaState['root']['dashboard'];
};

export type SavedGeoDaConfig = {
  ai: GeoDaState['root']['ai'];
  uiState: GeoDaState['root']['uiState'];
  weights: Array<SavedWeightsProps>;
  plots: GeoDaState['root']['plots'];
  regressions: GeoDaState['root']['regressions'];
  dashboard: GeoDaState['root']['dashboard'];
};

export type GeoDaProject = {
  fileName: string;
  arrowTable: string;
  keplerConfig: SavedConfigV1['config'];
  geodaConfig: SavedGeoDaConfig;
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

  // load geodaConfig
  const geodaConfig = loadGeoDaConfig(geodaFileData.geodaConfig);

  return {
    fileName,
    arrowTable,
    arrowFormatData,
    keplerConfig: geodaFileData.keplerConfig,
    geodaConfig
  };
}

function saveWeights(weights: WeightsProps[]): SavedWeightsProps[] {
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
    };
  });

  return savedWeights;
}

function loadWeights(savedWeights: SavedWeightsProps[]): WeightsProps[] {
  const weights: WeightsProps[] = savedWeights.map((w: SavedWeightsProps) => {
    const valuesString = w.weights;
    const offsetsString = w.offsets;
    const values = new Uint32Array(base64ToArrayBuffer(valuesString));
    const offsets = new Uint32Array(base64ToArrayBuffer(offsetsString));
    const neighbors = [];

    for (let i = 0; i < offsets.length; i++) {
      const start = offsets[i];
      const end = i + 1 < offsets.length ? offsets[i + 1] : values.length;
      const neighborIds = values.slice(start, end);
      neighbors.push(Array.from(neighborIds));
    }

    return {
      weightsMeta: w.weightsMeta,
      weights: neighbors,
      ...(w.isNew ? {isNew: w.isNew} : {})
    };
  });

  return weights;
}

export function saveGeoDaConfig(root: GeoDaState['root']): SavedGeoDaConfig {
  // remove the file from the geodaConfig, since it will be reconstructed in open-file-modal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {file, ...geodaConfig} = root;

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

/**
 * Load the GeoDa config from the saved GeoDa config
 * @param geodaConfig The saved GeoDa config
 * @returns LoadedGeoDaConfig
 */
export function loadGeoDaConfig(geodaConfig: SavedGeoDaConfig): LoadedGeoDaConfig {
  // load the weights from base64 string to ArrayBuffer
  const weights = loadWeights(geodaConfig.weights);

  return {
    ai: geodaConfig.ai,
    uiState: geodaConfig.uiState,
    weights,
    plots: geodaConfig.plots,
    regressions: geodaConfig.regressions,
    dashboard: geodaConfig.dashboard
  };
}
