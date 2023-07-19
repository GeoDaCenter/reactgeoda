import React, { useEffect } from "react";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import { useDispatch } from "react-redux";
import { ReactReduxContext } from "react-redux";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const KeplerMap = ({ data, width, height }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (data && data.fields && data.rows) {
      const fields = data.fields.map(field => ({name: field.name, format: field.format, type: field.type, id: field.id}));
  
      // No need to convert rows anymore, should be in the correct format
      const rows = data.rows;

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





