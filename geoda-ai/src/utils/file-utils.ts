import {ALL_FIELD_TYPES, DATASET_FORMATS} from '@kepler.gl/constants';
import {Field} from '@kepler.gl/types';
import {Feature} from 'geojson';
import {geojsonFeaturesToArrow, ArrowLoader} from '@loaders.gl/arrow';
import {
  Field as ArrowField,
  Float64 as ArrowFloat,
  Int32 as ArrowInteger,
  Bool as ArrowBool,
  List as ArrowList,
  Utf8 as ArrowString,
  makeVector,
  vectorFromArray,
  Data as ArrowData,
  Schema as ArrowSchema,
  Table as ArrowTable,
  makeBuilder,
  RecordBatch as ArrowRecordBatch
} from 'apache-arrow';
import {generateHashIdFromString} from '@kepler.gl/utils';
import {_BrowserFileSystem as BrowserFileSystem, parseInBatches} from '@loaders.gl/core';
import {ShapefileLoader} from '@loaders.gl/shapefile';
import {CSVLoader} from '@loaders.gl/csv';
import {_GeoJSONLoader as GeoJSONLoader} from '@loaders.gl/json';
import {
  FileCacheItem,
  ProcessFileDataContent,
  isArrowData,
  makeProgressIterator,
  processFileData,
  readBatch,
  readFileInBatches
} from '@kepler.gl/processors';
import {loadGeoDaProject, ProcessDropFilesOutput} from './project-utils';

const CSV_LOADER_OPTIONS = {
  shape: 'object-row-table',
  dynamicTyping: false // not working for now
};

const ARROW_LOADER_OPTIONS = {
  shape: 'arrow-table'
};

const JSON_LOADER_OPTIONS = {
  shape: 'object-row-table',
  // instruct loaders.gl on what json paths to stream
  jsonpaths: [
    '$', // JSON Row array
    '$.features', // GeoJSON
    '$.datasets' // KeplerGL JSON
  ]
};

const SHAPEFILE_LOADER_OPTIONS = {
  // TODO: loaders.gl only support shape: 'geojson-table' for now
  shape: 'object-row-table'
};

export async function loadArrowFile(file: File) {
  try {
    // const batches = await readFileInBatches({file, fileCache, loaders, loadOptions});
    const loadOptions = {
      arrow: ARROW_LOADER_OPTIONS,
      metadata: true,
      gis: {reproject: true}
    };
    const loaders = [ArrowLoader];
    const batchIterator = await parseInBatches(file, loaders, loadOptions);
    const progressIterator = makeProgressIterator(batchIterator, {size: file.size});
    const batches = readBatch(progressIterator, file.name);

    let result = await batches.next();
    let content: ProcessFileDataContent = {data: [], fileName: ''};
    let parsedData: FileCacheItem[] = [];

    while (!result.done) {
      content = result.value as ProcessFileDataContent;
      result = await batches.next();
      if (result.done) {
        parsedData = await processFileData({
          content,
          fileCache: []
        });
        break;
      }
    }

    const arrowTable = new ArrowTable(content.data as ArrowRecordBatch[]);
    return {
      fileName: content.fileName,
      dataId: parsedData[0].info.id,
      arrowTable,
      arrowFormatData: parsedData[0]
    };
  } catch (e: any) {
    throw new Error('Failed to load arrow file. Details: ' + e.message);
  }
}

export async function processDropFiles(
  files: File[],
  isAddingDataset = false
): Promise<ProcessDropFilesOutput> {
  // check if there is a file with extension .geoda
  const geodaFile = files.find(file => file.name.endsWith('.geoda'));
  if (geodaFile) {
    if (isAddingDataset === true) {
      throw new Error('GeoDa project file cannot be added to the current project.');
    }
    // process project file
    return await loadGeoDaProject(geodaFile);
  }

  // otherwise check if there is a file with extension .shp
  return await loadDroppedFile(files);
}

/**
 * Handle dropped files, and return the file name, arrowTable and arrowFormatData
 * We assume that only one dataset will be dropped at a time
 * @param files The files dropped by user
 * @returns
 */
export async function loadDroppedFile(files: File[]): Promise<ProcessDropFilesOutput> {
  const loaders = [ShapefileLoader, CSVLoader, ArrowLoader, GeoJSONLoader];
  const fileCache: FileCacheItem[] = [];
  const droppedFilesFS = new BrowserFileSystem(files);

  // otherwise check if there is a file with extension .shp
  const shpFile = files.find(file => file.name.endsWith('.shp'));
  const prjFile = files.find(file => file.name.endsWith('.prj'));
  // check if there are associated .dbf, .shx, .prj files with the .shp file
  if (shpFile) {
    const dbfFile = files.find(file => file.name.endsWith('.dbf'));
    if (!dbfFile) {
      throw new Error(
        'Shapefile must have associated .dbf, .shx and .prj files. Please drop all files.'
      );
    }
  }
  // use shpFile if it exists, otherwise use the first file
  const file = shpFile || files[0];

  const loadOptions = {
    csv: CSV_LOADER_OPTIONS,
    arrow: ARROW_LOADER_OPTIONS,
    json: JSON_LOADER_OPTIONS,
    shapefile: SHAPEFILE_LOADER_OPTIONS,
    metadata: true,
    fetch: droppedFilesFS.fetch,
    gis: {reproject: prjFile ? true : false},
    shp: {_maxDimensions: Number.MAX_SAFE_INTEGER}
  };

  const batches = await readFileInBatches({file, fileCache, loaders, loadOptions});
  let result = await batches.next();
  let content: ProcessFileDataContent = {data: [], fileName: ''};
  let parsedData: FileCacheItem[] = [];

  // let totalRowCount = 0;
  while (!result.done) {
    // get progress
    // totalRowCount += result.value.progress.rowCountInBatch;
    content = result.value as ProcessFileDataContent;
    result = await batches.next();
    if (result.done) {
      if (shpFile) {
        // content.data is Feature[] array, so we need to convert it to JSON shape
        // {type: "FeatureCollection", features: Feature[]}
        content.data = {
          type: 'FeatureCollection',
          features: content.data as Feature[]
        };
      }
      parsedData = await processFileData({
        content,
        fileCache: []
      });
      break;
    }
  }

  if (isArrowData(content.data)) {
    const arrowTable = new ArrowTable(content.data as ArrowRecordBatch[]);
    return {datasets: [{fileName: content.fileName, arrowTable, arrowFormatData: parsedData[0]}]};
  }

  // convert other spatial data format e.g. GeoJSON, Shapefile to arrow table
  return {
    datasets: [
      {
        fileName: content.fileName,
        ...convertFileCacheItemToArrowTable(parsedData[0])
      }
    ]
  };
}

/**
 * Read FileCacheItem, and use the file extension info.label to get the file type,
 * if the file type is not arrow, then convert the data.rows to ArrowTable using the data.fields info.
 */
export function convertFileCacheItemToArrowTable(fileCacheItem: FileCacheItem) {
  const {data} = fileCacheItem;
  // get column values from data.rows
  const columnValues: unknown[][] = [];
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    for (let j = 0; j < row.length; j++) {
      columnValues[j] = columnValues[j] || [];
      columnValues[j].push(row[j]);
    }
  }
  // get field and vector from data.fields and columnValues
  const fields: ArrowField[] = [];
  const vectors: {[key: string]: ArrowData} = {};

  for (let i = 0; i < data.fields.length; i++) {
    const field: Field = data.fields[i];
    const {name, type} = field;
    const {arrowField, arrowVector} = KeplerFieldTypeToArrowFieldType(name, type, columnValues[i]);
    fields.push(arrowField);
    vectors[name] = arrowVector.data[0];
  }
  // make a new ArrowTable
  const schema = new ArrowSchema(fields);
  // construct arrow Batches from vectors
  // const batches = new ArrowRecordBatch(arrowColumns);
  // @ts-ignore TODO fix me distributeVectorsIntoRecordBatches
  const arrowTable = new ArrowTable(schema, vectors);
  // append metadata from geoarrow fields to fileCacheItem.data.fields for geometry field
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i];
    if (data.fields[i].type === ALL_FIELD_TYPES.geojson) {
      const metadata = field.metadata;
      if (metadata) {
        data.fields[i].metadata = metadata;
      }
    }
  }
  // set fileCacheItem.cols
  const cols = [...Array(arrowTable.numCols).keys()].map(i => arrowTable.getChildAt(i));
  fileCacheItem.data.cols = cols;
  // remove fileCacheItem.data.rows
  delete fileCacheItem.data.rows;
  fileCacheItem.data.rows = [];
  // change fileCacheItem.info.format to arrow
  fileCacheItem.info.format = DATASET_FORMATS.arrow;
  // generate unique id using fileName string
  const id = generateHashIdFromString(fileCacheItem.info.label);
  fileCacheItem.info.id = id;
  // fileCacheItem.data.fields = [fileCacheItem.data.fields[0]];
  return {arrowTable, arrowFormatData: fileCacheItem};
}

function KeplerFieldTypeToArrowFieldType(name: string, type: string, values: unknown[]) {
  if (type === ALL_FIELD_TYPES.real) {
    const arrowField = new ArrowField(name, new ArrowFloat());
    const arrowVector = makeVector(new Float64Array(values as number[]));
    return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.integer) {
    const arrowField = new ArrowField(name, new ArrowInteger());
    const arrowVector = makeVector(new Int32Array(values as number[]));
    return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.boolean) {
    const arrowField = new ArrowField(name, new ArrowBool());
    const arrowVector = makeVector(new Uint8Array(values as number[]));
    return {arrowField, arrowVector};
    // NOTE: kepler.gl use new Date(raw value) for date and timestamp type, so we need to store raw values here
    // } else if (type === ALL_FIELD_TYPES.date) {
    //   const arrowField = new ArrowField(name, new ArrowDate(ArrowDateUnit.DAY));
    //   // @ts-ignore fix me
    //   const arrowVector = vectorFromArray(values.map(v => new Date(v)));
    //   return {arrowField, arrowVector};
    // } else if (type === ALL_FIELD_TYPES.timestamp) {
    //   const arrowField = new ArrowField(name, new TimestampSecond());
    //   const arrowVector = vectorFromArray(
    //     // @ts-ignore fix me
    //     values.map(v => new Date(v)),
    //     new TimestampSecond()
    //   );
    //   return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.array) {
    const arrowField = new ArrowField(
      name,
      new ArrowList(new ArrowField(`${name}-list`, new ArrowFloat()))
    );
    const arrowVector = vectorFromArray(values);
    return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.geojson) {
    // convert geojson column to arrow vector
    const {field, geometry} = geojsonFeaturesToArrow(name, values as Feature[]);
    return {arrowField: field, arrowVector: geometry};
  } else {
    const arrowField = new ArrowField(name, new ArrowString());
    const utf8Builder = makeBuilder({type: new ArrowString(), nullValues: [null, 'n/a']});
    for (let i = 0; i < values.length; i++) {
      utf8Builder.append(values[i] as string);
    }
    const arrowVector = utf8Builder.finish().toVector();
    return {arrowField, arrowVector};
  }
}

// function to convert arraybuffer to base64 string
export function arrayBufferToBase64(buffer: ArrayBuffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// function to convert base64 string to arraybuffer
export function base64ToArrayBuffer(base64: string) {
  var binary_string = atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

// download string to file in browser using anchor tag
export function downloadStringToFile(content: string, fileName: string, contentType: string) {
  const a = document.createElement('a');
  const file = new Blob([content], {type: contentType});
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(a.href);
}
