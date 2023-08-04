import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import KeplerGl from 'kepler.gl';
import {addDataToMap, forwardTo} from 'kepler.gl/actions';
import {processGeojson} from 'kepler.gl/processors';
import {MAPBOX_TOKEN} from '../constants';
import ChoroplethTest from './ChoroplethTest';
import MoranTest from './MoranTest';

const mapId = 'kepler_map';

const KeplerMap = ({dispatch, geojsonUrl}) => {
  console.log(geojsonUrl);
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  const data = useSelector(state => state.root.file.fileData);

  useEffect(() => {
    if (data && data.fields && data.rows) {
      const fields = data.fields.map(field => ({
        name: field.name,
        format: field.format,
        type: field.type,
        id: field.id
      }));

      const rows = data.rows;

      const dataset = {
        info: {id: 'my_data', label: 'my data'},
        data: {fields, rows}
      };
      keplerGlDispatch(addDataToMap({datasets: dataset}));
    }
    if (geojsonUrl) {
      fetch(geojsonUrl)
        .then(response => response.json())
        .then(data => {
          keplerGlDispatch(
            addDataToMap({
              datasets: {data: processGeojson(data)},
              options: {centerMap: true, readOnly: true}
            })
          );
        });
    }
  }, [data, geojsonUrl, keplerGlDispatch]);

  return (
    <div>
      <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />
      <ChoroplethTest mapId={mapId} />
      <MoranTest mapId={mapId} />
    </div>
  );
};

const mapStateToProps = state => ({
  data: state.root.file.fileData
});

export default connect(mapStateToProps)(KeplerMap);
