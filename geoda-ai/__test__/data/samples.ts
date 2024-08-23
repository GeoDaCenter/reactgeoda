const pointGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749]
      },
      properties: {
        name: 'Sample Point 1'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4195, 37.7748]
      },
      properties: {
        name: 'Sample Point 2'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4196, 37.7747]
      },
      properties: {
        name: 'Sample Point 3'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [-122.4197, 37.7746]
      },
      properties: {
        name: 'Sample Point 4'
      }
    }
  ]
};

const fileContent = JSON.stringify(pointGeoJSON);

export const pointFile = new File([fileContent], 'point.geojson', {type: 'application/geo+json'});

const pointCsv = `lat,lng,name\n37.7749,-122.4194,Sample Point 1\n37.7748,-122.4195,Sample Point 2\n37.7747,-122.4196,Sample Point 3\n37.7746,-122.4197,Sample Point 4`;

export const pointCsvFile = new File([pointCsv], 'point.csv', {type: 'text/csv'});
