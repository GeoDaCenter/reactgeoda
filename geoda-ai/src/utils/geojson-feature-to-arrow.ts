import {FeatureCollection} from 'geojson';

/** convert geojson object to arrow table
 * @param geojson
 * @returns {Promise<ArrowTable>} arrow table
 */
export async function geojsonToArrow(fc: FeatureCollection) {
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
