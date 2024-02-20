import {Feature} from 'geojson';
import {Schema as ArrowSchema, Table as ArrowTable} from 'apache-arrow';
import {
  parseGeometryFromArrow,
  geojsonPointToArrow,
  geojsonMultiPointToArrow,
  geojsonLineStringToArrow,
  geojsonPolygonToArrow,
  geojsonMultiLineStringToArrow,
  geojsonMultiPolygonToArrow
} from '@loaders.gl/arrow';

describe('file-utils', () => {
  describe('geojsonToArrow', () => {
    it('should convert a GeoJSON FeatureCollection to an ArrowTable', async () => {
      // Test implementation here
    });
  });

  describe('geojsonPointToArrow', () => {
    it('should convert an array of GeoJSON Points to an Arrow Vector', () => {
      const points: Feature[] = [
        {type: 'Feature', geometry: {type: 'Point', coordinates: [-122.45, 37.78]}, properties: {}},
        {type: 'Feature', geometry: {type: 'Point', coordinates: [-77.03, 38.91]}, properties: {}}
      ];
      const {field, geometry} = geojsonPointToArrow('geometry', points);
      const schema = new ArrowSchema([field]);
      // @ts-ignore
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.point';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(points[0].geometry);
    });
  });

  describe('geojsonMultiPointToArrow', () => {
    it('should convert an array of GeoJSON MultiPoints to an Arrow Vector', () => {
      const multipoints: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates: [
              [-122.45, 37.78],
              [-77.03, 38.91]
            ]
          },
          properties: {}
        },
        {
          type: 'Feature',
          geometry: {
            type: 'MultiPoint',
            coordinates: [
              [-222.45, 27.78],
              [-27.03, 28.91]
            ]
          },
          properties: {}
        }
      ];
      const {field, geometry} = geojsonMultiPointToArrow('geometry', multipoints);
      const schema = new ArrowSchema([field]);
      // @ts-ignore
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.multipoint';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(multipoints[0].geometry);
    });
  });

  describe('geojsonLineStringToArrow', () => {
    it('should convert an array of GeoJSON LineStrings to an Arrow Data', () => {
      const lines: Feature[] = [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [-122.45, 37.78],
              [-77.03, 38.91]
            ]
          },
          properties: {}
        },
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [
              [-122.45, 37.78],
              [-77.03, 38.91]
            ]
          },
          properties: {}
        }
      ];
      const {field, geometry} = geojsonLineStringToArrow('geometry', lines);
      const schema = new ArrowSchema([field]);
      // @ts-ignore
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.linestring';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(lines[0].geometry);
    });
  });

  describe('geojsonMultiLineStringToArrow', () => {
    it('should convert an array of GeoJSON MultiLineStrings to an Arrow Vector', () => {
      const multilines: Feature[] = [
        {
          type: 'Feature',
          geometry: {
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
          properties: {}
        },
        {
          type: 'Feature',
          geometry: {
            type: 'MultiLineString',
            coordinates: [
              [
                [-122.45, 37.78],
                [-77.03, 38.91]
              ]
            ]
          },
          properties: {}
        }
      ];
      const {field, geometry} = geojsonMultiLineStringToArrow('geometry', multilines);
      const schema = new ArrowSchema([field]);
      // @ts-ignore
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.multilinestring';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(multilines[0].geometry);
    });
  });

  describe('geojsonPolygonToArrow', () => {
    it('should convert an array of GeoJSON Polygons to an Arrow Data', () => {
      const polygons: Feature[] = [
        {
          type: 'Feature',
          geometry: {
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
          properties: {}
        },
        {
          type: 'Feature',
          geometry: {
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
          properties: {}
        }
      ];
      const {field, geometry} = geojsonPolygonToArrow('geometry', polygons);
      const schema = new ArrowSchema([field]);
      // @ts-ignore
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.polygon';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(polygons[0].geometry);
    });
  });

  describe('geojsonMultiPolygonToArrow', () => {
    it('should convert an array of GeoJSON MultiPolygons to an Arrow Vector', () => {
      const multiPolygons: Feature[] = [
        {
          type: 'Feature',
          geometry: {
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
          properties: {}
        },
        {
          type: 'Feature',
          geometry: {
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
          },
          properties: {}
        }
      ];
      const {field, geometry} = geojsonMultiPolygonToArrow('geometry', multiPolygons);
      const schema = new ArrowSchema([field]);
      // @ts-ignore
      const table = new ArrowTable(schema, {geometry});

      const firstArrowGeometry = table.getChild('geometry')?.get(0);
      const encoding = 'geoarrow.multipolygon';

      const firstGeometry = parseGeometryFromArrow(firstArrowGeometry, encoding);
      expect(firstGeometry).toEqual(multiPolygons[0].geometry);
    });
  });
});
