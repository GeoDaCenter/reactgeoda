import React, {useEffect} from 'react';
import {connect, useSelector} from 'react-redux';
import KeplerGl from 'kepler.gl';
import {addDataToMap, forwardTo} from 'kepler.gl/actions';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const mapId = 'kepler_map';

const KeplerMap = ({dispatch}) => {
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
  }, [data, keplerGlDispatch]);

  return <KeplerGl id={mapId} width={700} mapboxApiAccessToken={MAPBOX_TOKEN} height={700} />;
};

const mapStateToProps = state => ({
  data: state.root.file.fileData
});

export default connect(mapStateToProps)(KeplerMap);
