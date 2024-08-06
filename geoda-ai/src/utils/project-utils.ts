import {arrayBufferToBase64, base64ToArrayBuffer, loadArrowFile} from './file-utils';
import {SavedConfigV1} from '@kepler.gl/schemas';
import {GeoDaState} from '@/store';
import {WeightsMeta} from 'geoda-wasm';
import {Table as ArrowTable, tableToIPC} from 'apache-arrow';
import {DATASET_FORMATS} from '@kepler.gl/constants';
import {WeightsProps} from '@/reducers/weights-reducer';
import {DatasetProps} from '@/reducers/file-reducer';

type SavedWeightsProps = {
  weightsMeta: WeightsMeta;
  weights: string;
  offsets: string;
  isNew?: boolean;
  datasetId: string;
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
  datasets: Array<{
    fileName: string;
    arrowTable: string;
    dataId: string;
  }>;
  keplerConfig: SavedConfigV1['config'];
  geodaConfig: SavedGeoDaConfig;
};

export type ProcessDropFilesOutput = {
  datasets: Array<DatasetProps>;
  keplerConfig?: SavedConfigV1['config'];
  geodaConfig?: LoadedGeoDaConfig;
};

function getDataFormat(fileName: string) {
  const suffix = fileName.split('.').pop()?.toLocaleLowerCase();

  if (suffix === 'arrow') {
    return DATASET_FORMATS.arrow;
  } else if (suffix === 'geojson') {
    return DATASET_FORMATS.geojson;
  } else if (suffix === 'shp') {
    return DATASET_FORMATS.arrow;
  } else if (suffix === 'csv') {
    return DATASET_FORMATS.csv;
  }
  return '';
}

export async function loadGeoDaProject(geodaFile: File): Promise<ProcessDropFilesOutput> {
  const geodaFileContent = await geodaFile.text();
  const geodaFileData: GeoDaProject = JSON.parse(geodaFileContent);

  // process datasets
  const datasets: Array<DatasetProps> = [];
  for (let i = 0; i < geodaFileData.datasets.length; i++) {
    const dataset = geodaFileData.datasets[i];
    // convert arrowTable from base64 string to ArrayBuffer
    const arrowTableBuffer = Buffer.from(dataset.arrowTable, 'base64').buffer;
    // TODO: this could be simplified as
    // const apacheArrowTable = arrow.tableFromIPC([new Uint8Array(arrayBuffer)]);
    // update the file name if it is not ended with .arrow, otherwise the kepler.gl will read it according to the file suffix
    const fileName = dataset.fileName.endsWith('.arrow')
      ? dataset.fileName
      : `${dataset.fileName}.arrow`;
    // create a File object from the ArrayBuffer
    const arrowFile = new File([arrowTableBuffer], fileName);
    // load arrow file
    const {arrowTable, arrowFormatData} = await loadArrowFile(arrowFile);
    datasets.push({
      fileName: dataset.fileName,
      dataId: dataset.dataId,
      arrowTable,
      arrowFormatData: {
        ...arrowFormatData,
        info: {
          ...arrowFormatData.info,
          // restore the original file name if it is not ended with .arrow
          label: dataset.fileName,
          id: dataset.dataId,
          format: getDataFormat(dataset.fileName)
        }
      }
    });
  }

  // load geodaConfig
  const geodaConfig = loadGeoDaConfig(geodaFileData.geodaConfig);

  return {
    datasets,
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
      datasetId: w.datasetId,
      weightsMeta: w.weightsMeta,
      weights: neighbors,
      ...(w.isNew ? {isNew: w.isNew} : {})
    };
  });

  return weights;
}

export function saveGeoDaConfig(root: GeoDaState['root']): SavedGeoDaConfig {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {datasets, ...geodaConfig} = root;

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

  const updatedTextItems = geodaConfig.dashboard.textItems?.map(item => {
    return {
      ...item,
      content: JSON.stringify(item.content) || ''
    };
  });

  return {
    ai: geodaConfig.ai,
    uiState: geodaConfig.uiState,
    weights,
    plots: geodaConfig.plots,
    regressions: geodaConfig.regressions,
    // @ts-ignore textItems is not correctly typed since content has to be string instead of EditorState JSON object when loading from file
    dashboard: {
      ...geodaConfig.dashboard,
      ...(updatedTextItems ? {textItems: updatedTextItems} : {})
    }
  };
}

/**
 * Convert the Apache Arrow table to base64 string
 * @param arrowTable Apache Arrow table
 * @returns Base64 string of the Apache Arrow table
 */
export function getArrowTableAsBase64(arrowTable: ArrowTable) {
  const bufferArray = tableToIPC(arrowTable);
  return arrayBufferToBase64(bufferArray.buffer);
}
