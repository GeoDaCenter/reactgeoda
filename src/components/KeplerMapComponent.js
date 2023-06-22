

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import KeplerGl from 'kepler.gl';
import { addDataToMap } from 'kepler.gl/actions';
// import useSupercluster from 'use-supercluster';

const MAPBOX_TOKEN = process.env.pk.eyJ1IjoianVzdGlua2xlaWQiLCJhIjoiY2xqNTIybnp3MDZzaDNxcnF3MGhpZGt1aiJ9.NlpIZZvaK7DrIZ87qi1pZA; // Replace with your Mapbox token

const KeplerMapComponent = ({ data, id = 'map', mapboxToken = MAPBOX_TOKEN }) => {
  const dispatch = useDispatch();

  // Data format
  const dataset = {
    data: data,
    info: {
      id: id
    }
  };

  useEffect(() => {
    dispatch(addDataToMap({ datasets: dataset }));
  }, [dispatch, dataset]);

  return (
    <KeplerGl
      id={id}
      mapboxApiAccessToken={mapboxToken}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
};

export default KeplerMapComponent;
