import React, { useEffect } from "react";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import { useDispatch } from "react-redux";
import { ReactReduxContext } from "react-redux";

// Upload your mapbox token here
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const KeplerMap = ({ data, width, height }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data.length !== 0) {
      // Get fields array from the first row's keys
      const fields = Object.keys(data[0]).map(key => ({name: key, format: '', type: 'real', id: key}));

      // Array of objects --> array of arrays for rows
      const rows = data.map(rowObj => Object.values(rowObj));

      const dataset = {
        info: { id: "my_data", label: "my data" },
        data: { fields, rows },
      };
      dispatch(addDataToMap({ datasets: dataset }));
    }
  }, [data, dispatch]);

  return (
    <ReactReduxContext.Consumer>
      {({ store }) => (
        <KeplerGl
          id="map"
          width={width}
          mapboxApiAccessToken={MAPBOX_TOKEN}
          height={height}
          store={store}
        />
      )}
    </ReactReduxContext.Consumer>
  );
};
export default KeplerMap;





