import {BinaryFeatureCollection} from '@loaders.gl/schema';

/**
 * binary geometry template, see deck.gl BinaryGeometry
 */
export function getBinaryGeometryTemplate() {
  return {
    globalFeatureIds: {value: new Uint32Array(0), size: 1},
    positions: {value: new Float32Array(0), size: 2},
    properties: [],
    numericProps: {},
    featureIds: {value: new Uint32Array(0), size: 1}
  };
}
export const binaryPointGeometries: BinaryFeatureCollection[] = [
  {
    shape: 'binary-feature-collection',
    points: {
      ...getBinaryGeometryTemplate(),
      type: 'Point',
      globalFeatureIds: {value: new Uint32Array([0, 1]), size: 1},
      positions: {value: new Float64Array([1, 1, 2, 2]), size: 2},
      properties: [{index: 0}, {index: 1}],
      featureIds: {value: new Uint32Array([0, 1]), size: 1}
    },
    lines: {
      ...getBinaryGeometryTemplate(),
      type: 'LineString',
      pathIndices: {value: new Uint16Array(0), size: 1}
    },
    polygons: {
      ...getBinaryGeometryTemplate(),
      type: 'Polygon',
      polygonIndices: {value: new Uint16Array(0), size: 1},
      primitivePolygonIndices: {value: new Uint16Array(0), size: 1}
    }
  }
];
