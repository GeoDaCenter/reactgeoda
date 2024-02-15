import {Point, MultiPoint, LineString, Polygon, MultiLineString, MultiPolygon} from 'geojson';
import {Schema as ArrowSchema, Table as ArrowTable} from 'apache-arrow';
import {parseGeometryFromArrow} from '@loaders.gl/arrow';
import {
  geojsonPointToArrowVector,
  geojsonMultiPointToArrowVector,
  geojsonLineStringToArrowVector,
  geojsonPolygonToArrowVector,
  geojsonMultiLineStringToArrowVector,
  geojsonMultiPolygonToArrowVector
} from '../../src/utils/file-utils';

describe('file-utils', () => {
  describe('geojsonToArrow', () => {
    it('should convert a GeoJSON FeatureCollection to an ArrowTable', async () => {
      // Test implementation here
    });
  });

  describe('geojsonPointToArrowVector', () => {
    it('should convert an array of GeoJSON Points to an Arrow Vector', () => {
      const points: Point[] = [
        {type: 'Point', coordinates: [-122.45, 37.78]},
        {type: 'Point', coordinates: [-77.03, 38.91]}
      ];
      const {field, geometry} = geojsonPointToArrowVector(points);
      const schema = new ArrowSchema([field]);
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.point';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(points[0]);
    });
  });

  describe('geojsonMultiPointToArrowVector', () => {
    it('should convert an array of GeoJSON MultiPoints to an Arrow Vector', () => {
      const multipoints: MultiPoint[] = [
        {
          type: 'MultiPoint',
          coordinates: [
            [-122.45, 37.78],
            [-77.03, 38.91]
          ]
        },
        {
          type: 'MultiPoint',
          coordinates: [
            [-222.45, 27.78],
            [-27.03, 28.91]
          ]
        }
      ];
      const {field, geometry} = geojsonMultiPointToArrowVector(multipoints);
      const schema = new ArrowSchema([field]);
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.multipoint';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(multipoints[0]);
    });
  });

  describe('geojsonLineStringToArrowVector', () => {
    it('should convert an array of GeoJSON LineStrings to an Arrow Data', () => {
      const lines: LineString[] = [
        {
          type: 'LineString',
          coordinates: [
            [-122.45, 37.78],
            [-77.03, 38.91]
          ]
        },
        {
          type: 'LineString',
          coordinates: [
            [-122.45, 37.78],
            [-77.03, 38.91]
          ]
        }
      ];
      const {field, geometry} = geojsonLineStringToArrowVector(lines);
      const schema = new ArrowSchema([field]);
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.linestring';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(lines[0]);
    });
  });

  describe('geojsonMultiLineStringToArrowVector', () => {
    it('should convert an array of GeoJSON MultiLineStrings to an Arrow Vector', () => {
      const multilines: MultiLineString[] = [
        {
          type: 'MultiLineString',
          coordinates: [
            [
              [-122.45, 37.78],
              [-77.03, 38.91]
            ],
            [
              [-22.45, 7.78],
              [-7.03, 8.91]
            ]
          ]
        },
        {
          type: 'MultiLineString',
          coordinates: [
            [
              [-122.45, 37.78],
              [-77.03, 38.91]
            ]
          ]
        }
      ];
      const {field, geometry} = geojsonMultiLineStringToArrowVector(multilines);
      const schema = new ArrowSchema([field]);
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.multilinestring';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(multilines[0]);
    });
  });

  describe('geojsonPolygonToArrowVector', () => {
    it('should convert an array of GeoJSON Polygons to an Arrow Data', () => {
      const polygons: Polygon[] = [
        {
          type: 'Polygon',
          coordinates: [
            [
              [-122.45, 37.78],
              [-77.03, 38.91],
              [-77.03, 38.91],
              [-122.45, 37.78]
            ]
          ]
        },
        {
          type: 'Polygon',
          coordinates: [
            [
              [-122.45, 37.78],
              [-77.03, 38.91],
              [-77.03, 38.91],
              [-122.45, 37.78]
            ]
          ]
        }
      ];
      const {field, geometry} = geojsonPolygonToArrowVector(polygons);
      const schema = new ArrowSchema([field]);
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.polygon';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(polygons[0]);
    });
  });

  describe('geojsonMultiPolygonToArrowVector', () => {
    it('should convert an array of GeoJSON MultiPolygons to an Arrow Vector', () => {
      const multiPolygons: MultiPolygon[] = [
        {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [-122.45, 37.78],
                [-77.03, 38.91],
                [-77.03, 38.91],
                [-122.45, 37.78]
              ],
              [
                [-122.45, 37.78],
                [-77.03, 38.91],
                [-77.03, 38.91],
                [-122.45, 37.78]
              ]
            ]
          ]
        },
        {
          type: 'MultiPolygon',
          coordinates: [
            [
              [
                [-122.45, 37.78],
                [-77.03, 38.91],
                [-77.03, 38.91],
                [-122.45, 37.78]
              ]
            ]
          ]
        }
      ];
      const {field, geometry} = geojsonMultiPolygonToArrowVector(multiPolygons);
      const schema = new ArrowSchema([field]);
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.multipolygon';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(multiPolygons[0]);
    });
  });
});
