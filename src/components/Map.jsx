'use client'

import ReactMapGL from 'react-map-gl';
import { useState } from 'react';

function MapComponent() {
  const [viewport, setViewport] = useState({
    latitude: 37.7577,
    longitude: -122.4376,
    zoom: 8
  });

  return (
    <ReactMapGL
      {...viewport}
      width="100%"
      height="100%"
      onViewportChange={(viewport) => setViewport(viewport)}
    />
  );
}

export default MapComponent;