import {Table as ArrowTable, tableFromIPC} from 'apache-arrow';
import {convertFileCacheItemToArrowTable, loadArrowFile} from './file-utils';
import {SavedConfigV1} from '@kepler.gl/schemas';
import {GeoDaState} from '@/store';
import { FileCacheItem } from '@kepler.gl/processors';

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
