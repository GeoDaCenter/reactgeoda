import {ALL_FIELD_TYPES, DATASET_FORMATS} from '@kepler.gl/constants';
import {FileCacheItem} from '@kepler.gl/processors';
import {Field} from '@kepler.gl/types';
import {Feature} from 'geojson';
import {geojsonFeaturesToArrow} from '@loaders.gl/arrow';
import {
  Field as ArrowField,
  Float64 as ArrowFloat,
  Int32 as ArrowInteger,
  Bool as ArrowBool,
  Date_ as ArrowDate,
  DateUnit as ArrowDateUnit,
  Timestamp as ArrowTimestamp,
  TimeUnit as ArrowTimeUnit,
  List as ArrowList,
  Utf8 as ArrowString,
  makeVector,
  vectorFromArray,
  Vector as ArrowVector,
  Schema as ArrowSchema,
  Table as ArrowTable,
  makeBuilder
} from 'apache-arrow';

/**
 * Read FileCacheItem, and use the file extension info.label to get the file type,
 * if the file type is not arrow, then convert the data.rows to ArrowTable using the data.fields info.
 */
export function convertFileCacheItemToArrowTable(fileCacheItem: FileCacheItem) {
  const {data, info} = fileCacheItem;
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
  const vectors: {[key: string]: ArrowVector} = {};

  for (let i = 0; i < data.fields.length; i++) {
    const field: Field = data.fields[i];
    const {name, type} = field;
    const {arrowField, arrowVector} = KeplerFieldTypeToArrowFieldType(name, type, columnValues[i]);
    fields.push(arrowField);
    vectors[name] = arrowVector;
  }
  // make a new ArrowTable
  const schema = new ArrowSchema(fields);
  // @ts-ignore TODO FIXME
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
  } else if (type === ALL_FIELD_TYPES.date) {
    const arrowField = new ArrowField(name, new ArrowDate(ArrowDateUnit.DAY));
    const arrowVector = vectorFromArray(values);
    return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.timestamp) {
    const arrowField = new ArrowField(name, new ArrowTimestamp(ArrowTimeUnit.SECOND));
    const arrowVector = vectorFromArray(values);
    return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.array) {
    const arrowField = new ArrowField(
      name,
      new ArrowList(new ArrowField(`${name}-list`, new ArrowFloat()))
    );
    const arrowVector = vectorFromArray(values);
    return {arrowField, arrowVector};
  } else if (type === ALL_FIELD_TYPES.geojson) {
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
