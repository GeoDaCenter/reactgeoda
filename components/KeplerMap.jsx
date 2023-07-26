import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import KeplerGl from 'kepler.gl';
import {addDataToMap, forwardTo} from 'kepler.gl/actions';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const mapId = 'kepler_map';

const KeplerMap = ({data, width, height, dispatch}) => {
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  useEffect(() => {
    console.log('Running KeplerMap useEffect', data, keplerGlDispatch);
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
      console.log(dataset);
    }
  }, [data, keplerGlDispatch]);

  return <KeplerGl id={mapId} width={width} mapboxApiAccessToken={MAPBOX_TOKEN} height={height} />;
};

const mapStateToProps = state => ({
  data: state.root.file.fileData
});

export default connect(mapStateToProps)(KeplerMap);
