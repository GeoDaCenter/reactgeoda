import {
  Table as ArrowTable,
  Float64 as ArrowFloat,
  FixedSizeList,
  Field as ArrowField,
  List as ArrowList,
  makeBuilder
} from 'apache-arrow';
import {
  FeatureCollection,
  Point,
  MultiPoint,
  LineString,
  MultiLineString,
  Polygon,
  MultiPolygon,
  Feature
} from 'geojson';

/** convert geojson object to arrow table
 * @param geojson
 * @returns {Promise<ArrowTable>} arrow table
 */
export async function geojsonToArrow(fc: FeatureCollection): Promise<ArrowTable> {
  let data: {[key: string]: Array<unknown>} = {};
  // iterate over the features
  for (let i = 0; i < fc.features.length; i++) {
    const {properties, geometry} = fc.features[i];

    // iterate over the properties and store the key as column name and value as row value
    if (properties) {
      const columnNames = Object.keys(properties);
      // create a data object to store the column data, key is columnName value is array of data
      if (Object.keys(data).length === 0) {
        data = columnNames.reduce((acc: {[key: string]: []}, colName: string) => {
          acc[colName] = [];
          return acc;
        }, {});
      }
      // iterate over the columnNames and push the data to the data object
      columnNames.forEach((colName: string) => {
        data[colName].push(properties[colName]);
      });
    }

    // add key 'geometry' to the data object
    if (geometry) {
      data['geometry'] = data['geometry'] || [];
      data['geometry'].push(geometry);
    }
  }

  // convert the data object to arrow table
}

export function geojsonFeaturesToArrow(name: string, features: Feature[]) {
  // get the geometry type by iterating all features
  // if one geometry is multi-, then the whole geometry is multi-
  let geometryType = '';
  for (let i = 0; i < features.length; i++) {
    const {geometry} = features[i];
    if (i === 0) {
      geometryType = geometry.type;
    }
    if (geometry.type.includes('Multi')) {
      geometryType = geometry.type;
      break;
    }
  }
  if (geometryType === 'Point') {
    return geojsonPointToArrowVector(name, features);
  } else if (geometryType === 'MultiPoint') {
    return geojsonMultiPointToArrowVector(name, features);
  } else if (geometryType === 'LineString') {
    return geojsonLineStringToArrowVector(name, features);
  } else if (geometryType === 'MultiLineString') {
    return geojsonMultiLineStringToArrowVector(name, features);
  } else if (geometryType === 'Polygon') {
    return geojsonPolygonToArrowVector(name, features);
  } else if (geometryType === 'MultiPolygon') {
    return geojsonMultiPolygonToArrowVector(name, features);
  }
  throw new Error('Unsupported geometry type');
}
/**
 * convert GeoJSON Point to arrow.Vector
 */
export function geojsonPointToArrowVector(name: string, points: Feature[]) {
  // get dimension from the first point
  const dimension = (points[0].geometry as Point).coordinates.length;
  const pointFieldName = dimension === 2 ? 'xy' : 'xyz';

  // get point type
  const nullable = false;
  const coordType = new ArrowFloat();
  const pointType = new FixedSizeList(
    dimension,
    new ArrowField(pointFieldName, coordType, nullable)
  );

  // create a field
  const metaData: Map<string, string> = new Map(
    Object.entries({
      'ARROW:extension:name': 'geoarrow.point'
    })
  );
  const field = new ArrowField(name, pointType, nullable, metaData);

  // make geoarrow builder
  const builder = makeBuilder({
    type: pointType,
    nullValues: [null]
  });

  // fill builder with coordinates
  for (let i = 0; i < points.length; i++) {
    const coords = (points[i].geometry as Point).coordinates;
    builder.append(coords);
  }

  // build geometry vector
  const geometry = builder.finish().toVector();

  return {
    field,
    geometry
  };
}

/**
 * convert GeoJSON Point to arrow.Vector
 */
export function geojsonMultiPointToArrowVector(name: string, points: Feature[]) {
  // get dimension from the first multipoint
  const dimension = (points[0].geometry as MultiPoint).coordinates[0].length;
  const pointFieldName = dimension === 2 ? 'xy' : 'xyz';

  // get multipoint type
  const nullable = false;
  const coordType = new ArrowFloat();
  const pointType = new FixedSizeList(
    dimension,
    new ArrowField(pointFieldName, coordType, nullable)
  );
  const multiPointType = new ArrowList(
    makeBuilder({
      type: pointType,
      nullValues: [null]
    })
  );

  // create a field
  const metaData: Map<string, string> = new Map(
    Object.entries({
      'ARROW:extension:name': 'geoarrow.multipoint'
    })
  );
  const field = new ArrowField(name, multiPointType, nullable, metaData);

  // make geoarrow builder
  const builder = makeBuilder({
    type: multiPointType,
    nullValues: [null]
  });

  for (let i = 0; i < points.length; i++) {
    const coords = (points[i].geometry as MultiPoint).coordinates;
    builder.append(coords);
  }

  const geometry = builder.finish().toVector();

  return {
    field,
    geometry
  };
}

/**
 * Convert GeoJSON LineString to arrow.Data
 */
export function geojsonLineStringToArrowVector(name: string, lines: Feature[]) {
  // get dimension from the first line
  const dimension = (lines[0].geometry as LineString).coordinates[0].length;
  const pointFieldName = dimension === 2 ? 'xy' : 'xyz';

  // get line type
  const nullable = false;
  const coordType = new ArrowFloat();
  const pointType = new FixedSizeList(
    dimension,
    new ArrowField(pointFieldName, coordType, nullable)
  );
  const lineType = new ArrowList(
    makeBuilder({
      type: pointType,
      nullValues: [null]
    })
  );

  // create a field
  const metaData: Map<string, string> = new Map(
    Object.entries({
      'ARROW:extension:name': 'geoarrow.linestring'
    })
  );
  const field = new ArrowField(name, lineType, nullable, metaData);

  // make geoarrow builder
  const builder = makeBuilder({
    type: lineType,
    nullValues: [null]
  });

  for (let i = 0; i < lines.length; i++) {
    const coords = (lines[i].geometry as LineString).coordinates;
    builder.append(coords);
  }

  const geometry = builder.finish().toVector();

  return {
    field,
    geometry
  };
}

/**
 * Convert GeoJSON MultiLineString to arrow.Vector
 */
export function geojsonMultiLineStringToArrowVector(name: string, lines: Feature[]) {
  // get dimension from the first line
  const dimension = (lines[0].geometry as MultiLineString).coordinates[0].length;
  const pointFieldName = dimension === 2 ? 'xy' : 'xyz';

  // get multi-line data type
  const nullable = false;
  const coordType = new ArrowFloat();
  const pointType = new FixedSizeList(
    dimension,
    new ArrowField(pointFieldName, coordType, nullable)
  );
  const lineType = new ArrowList(
    makeBuilder({
      type: pointType,
      nullValues: [null]
    })
  );
  const multiLineType = new ArrowList(
    makeBuilder({
      type: lineType,
      nullValues: [null]
    })
  );

  // create a field
  const metaData: Map<string, string> = new Map(
    Object.entries({
      'ARROW:extension:name': 'geoarrow.multilinestring'
    })
  );
  const field = new ArrowField(name, multiLineType, nullable, metaData);

  // make geoarrow builder
  const builder = makeBuilder({
    type: multiLineType,
    nullValues: [null]
  });

  for (let i = 0; i < lines.length; i++) {
    const coords = (lines[i].geometry as MultiLineString).coordinates;
    builder.append(coords);
  }

  const geometry = builder.finish().toVector();

  return {
    field,
    geometry
  };
}

/**
 * Convert GeoJSON Polygon to arrow.Data
 */
export function geojsonPolygonToArrowVector(name: string, polygons: Feature[]) {
  // get dimension from the first polygon
  const dimension = (polygons[0].geometry as Polygon).coordinates[0][0].length;
  const pointFieldName = dimension === 2 ? 'xy' : 'xyz';

  // get polygon data type
  const nullable = false;
  const coordType = new ArrowFloat();
  const pointType = new FixedSizeList(
    dimension,
    new ArrowField(pointFieldName, coordType, nullable)
  );
  const ringType = new ArrowList(
    makeBuilder({
      type: pointType,
      nullValues: [null]
    })
  );
  const polygonType = new ArrowList(
    makeBuilder({
      type: ringType,
      nullValues: [null]
    })
  );

  // create a field
  const metaData = new Map<string, string>([['ARROW:extension:name', 'geoarrow.polygon']]);
  const field = new ArrowField(name, polygonType, nullable, metaData);

  // make geoarrow builder
  const builder = makeBuilder({
    type: polygonType,
    nullValues: [null]
  });

  for (let i = 0; i < polygons.length; i++) {
    const coords = (polygons[i].geometry as Polygon).coordinates;
    builder.append(coords);
  }

  const geometry = builder.finish().toVector();

  return {
    field,
    geometry
  };
}

/**
 * Convert GeoJSON MultiPolygon to arrow.Vector
 */
export function geojsonMultiPolygonToArrowVector(name: string, polygons: Feature[]) {
  // get dimension from the first polygon
  const dimension = (polygons[0].geometry as MultiPolygon).coordinates[0][0][0].length;
  const pointFieldName = dimension === 2 ? 'xy' : 'xyz';

  // get polygon data type
  const nullable = false;
  const coordType = new ArrowFloat();
  const pointType = new FixedSizeList(
    dimension,
    new ArrowField(pointFieldName, coordType, nullable)
  );
  const ringType = new ArrowList(
    makeBuilder({
      type: pointType,
      nullValues: [null]
    })
  );
  const polygonType = new ArrowList(
    makeBuilder({
      type: ringType,
      nullValues: [null]
    })
  );
  const multiPolygonType = new ArrowList(
    makeBuilder({
      type: polygonType,
      nullValues: [null]
    })
  );

  // create a field
  const metaData = new Map<string, string>([['ARROW:extension:name', 'geoarrow.multipolygon']]);
  const field = new ArrowField(name, multiPolygonType, nullable, metaData);

  // make geoarrow builder
  const builder = makeBuilder({
    type: multiPolygonType,
    nullValues: [null]
  });

  for (let i = 0; i < polygons.length; i++) {
    const coords = (polygons[i].geometry as MultiPolygon).coordinates;
    builder.append(coords);
  }

  const geometry = builder.finish().toVector();

  return {
    field,
    geometry
  };
}
