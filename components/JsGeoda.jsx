import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {GeoJsonLayer} from '@deck.gl/layers';
import {StaticMap} from 'react-map-gl';
import colorbrewer from 'colorbrewer';
import jsgeoda from 'jsgeoda';
import DeckGL from '@deck.gl/react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const INITIAL_VIEW_STATE = {
  longitude: -100.4,
  latitude: 38.74,
  zoom: 2.5,
  maxZoom: 20
};

const JsGeoda = () => {
  const [layer, setLayer] = useState(null);
  const fileData = useSelector(state => state.root.file.fileData);

  useEffect(() => {
    const loadSpatialData = async geoda => {
      const nat = geoda.readGeoJSON(fileData);
      const hr60 = geoda.getCol(nat, 'HR60');
      const cb = geoda.customBreaks(nat, 'natural_breaks', hr60, 5);

      const newLayer = new GeoJsonLayer({
        id: 'GeoJsonLayer',
        data: fileData,
        filled: true,
        getFillColor: f => getFillColor(f, cb.breaks),
        stroked: true,
        pickable: true
      });

      setLayer(newLayer);
    };

    const getFillColor = (f, breaks) => {
      for (let i = 1; i < breaks.length; ++i) {
        if (f.properties.HR60 < breaks[i]) {
          return colorbrewer.YlOrBr[breaks.length - 1][i - 1]
            .match(/[0-9a-f]{2}/g)
            .map(x => parseInt(x, 16));
        }
      }
    };

    jsgeoda.New().then(geoda => {
      loadSpatialData(geoda);
    });
  }, [fileData]);

  return (
    <div>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        layers={[layer]}
        controller={true}
        getTooltip={({object}) => object && `${object.properties.NAME}: ${object.properties.HR60}`}
      >
        <StaticMap mapboxApiAccessToken={MAPBOX_TOKEN} />
      </DeckGL>
    </div>
  );
};

export default JsGeoda;
