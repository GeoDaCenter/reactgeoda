import React from "react";
import KeplerGl from "kepler.gl";
import {ReactReduxContext} from "react-redux";

const MAPBOX_TOKEN = process.env.MapboxAccessToken;

const Map = () => {
  return (
    <ReactReduxContext.Consumer>
      {({store}) => (
        <KeplerGl
          id="map"
          width={window.innerWidth}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          height={window.innerHeight}
          store={store}
        />
      )}
    </ReactReduxContext.Consumer>
  );
};

export default Map;
