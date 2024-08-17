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
