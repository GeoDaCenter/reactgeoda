import React, {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {addDataToMap} from 'kepler.gl/actions';
import KeplerGl from 'kepler.gl';
import jsgeoda from 'jsgeoda';
import colorbrewer from 'colorbrewer';
import {processRowObject, processGeojson} from 'kepler.gl/dist/processors';
import {color} from 'echarts';
import {layerVisualChannelChange} from 'kepler.gl/actions';
import {findDefaultColorField} from 'kepler.gl/dist/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const DATA_URL = 'https://webgeoda.github.io/data/natregimes.geojson';
const mapId = 'geoda_map';

const getFillColor = (hr60, breaks) => {
  for (let i = 1; i < breaks.length; ++i) {
    if (hr60 < breaks[i]) {
      return i;
    }
  }
  return breaks.length - 1;
};

const KeplerGeoda = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    jsgeoda.New().then(geoda => {
      fetch(DATA_URL)
        .then(response => response.arrayBuffer())
        .then(buffer => {
          const nat = geoda.read_geojson(buffer);
          const hr60 = geoda.get_col(nat, 'HR60');
          const cb = geoda.custom_breaks(nat, 'natural_breaks', hr60, 5);

          const jsonData = JSON.parse(new TextDecoder().decode(buffer));
          jsonData.features.forEach((feature, i) => {
            feature.properties.color = getFillColor(hr60[i], cb.breaks);
          });

          const geoDataProcessed = processGeojson(jsonData);
          let fields = [...geoDataProcessed.fields];
          fields.push({name: 'color', format: '', type: 'integer'});
          const rows = geoDataProcessed.rows.map((row, i) => {
            return [...row, getFillColor(hr60[i], cb.breaks)];
          });

          const dataset = {
            data: {
              fields: fields,
              rows: rows
            },
            info: {id: 'choro_data', label: 'choro data'}
          };

          const config = {
            version: 'v1',
            config: {
              visState: {
                filters: [],
                layers: [
                  {
                    type: 'geojson',
                    config: {
                      dataId: 'choro_data',
                      label: 'choro data',
                      columns: {
                        geojson: '_geojson'
                      },
                      color: [119, 110, 87, 255],
                      isVisible: true,
                      visConfig: {
                        colorDomain: [0, cb.breaks.length - 1],
                        colorRange: {
                          colors: colorbrewer.YlOrBr[cb.breaks.length - 1].map(color =>
                            color.match(/[0-9a-f]{2}/g).map(x => parseInt(x, 16))
                          )
                        }
                      },
                      visualChannels: {
                        colorField: {
                          name: 'color',
                          type: 'integer'
                        },
                        colorScale: 'quantile',
                        sizeField: null,
                        sizeScale: 'linear'
                      }
                    }
                  }
                ]
              }
            }
          };
          dispatch(addDataToMap({datasets: [dataset], config: config}));
        });
    });
  }, [dispatch]);

  return (
    <KeplerGl
      id={mapId}
      mapboxApiAccessToken={MAPBOX_TOKEN}
      width={800}
      height={800}
      onDataError={e => console.error(e)}
    />
  );
};

export default KeplerGeoda;
