// TODO: get shapefile rawdata working. Fix valueaccessor part
import React, {useEffect, useState, useMemo, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  addDataToMap,
  layerVisualChannelConfigChange,
  layerVisConfigChange,
  forwardTo
} from 'kepler.gl/actions';
import KeplerGl from 'kepler.gl';
import jsgeoda from 'jsgeoda';
import colorbrewer from 'colorbrewer';
import {processGeojson} from 'kepler.gl/dist/processors';
import {maybeToDate} from 'kepler.gl/dist/utils';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const mapId = 'geoda_map';

const ChoroplethMap = () => {
  // Redux and local states
  const dispatch = useDispatch();
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  const keplerGlDispatchRef = useRef(keplerGlDispatch);

  useEffect(() => {
    keplerGlDispatchRef.current = keplerGlDispatch;
  }, [keplerGlDispatch]);

  // Access necessary states
  const [cb, setCb] = useState(null);
  const choroplethMethod = useSelector(state => state.root.choroplethMethod);
  const numberOfBreaks = useSelector(state => state.root.numberOfBreaks);
  const selectedChoroplethVariable = useSelector(state => state.root.selectedChoroplethVariable);
  const layers = useSelector(state => state.keplerGl[mapId]?.visState?.layers);
  const jenksIdx = useSelector(state =>
    state.keplerGl[mapId]?.visState?.datasets?.choro_data?.fields?.findIndex(
      field => field.name === 'jenksCategory'
    )
  );

  const rowContainer = useSelector(
    state => state.keplerGl[mapId]?.visState?.datasets?.choro_data?.dataContainer
  );

  // Memoized layer for better performance
  const layer = useMemo(() => layers?.[layers.length - 1], [layers]);
  const data = useSelector(state => state.root.file.rawFileData); // stored raw data for jsgeoda TODO: fix jsgeoda to centralize data
  console.log(data);

  useEffect(() => {
    const fetchDataAndSetLayer = async () => {
      const geoda = await jsgeoda.New();

      // Make raw data into an array buffer
      const uint8Array = new TextEncoder().encode(JSON.stringify(data));
      const buffer = uint8Array.slice(0);

      const processedData = geoda.read_geojson(buffer);

      if (typeof selectedChoroplethVariable !== 'string') {
        console.error('selectedChoroplethVariable must be a string');
        return;
      }
      const col = geoda.getCol(processedData, selectedChoroplethVariable);

      if (!col) {
        console.error('Invalid column selected');
        return;
      }
      const breaks = await geoda.customBreaks(processedData, choroplethMethod, col, numberOfBreaks);

      if (!breaks || !breaks.breaks) {
        console.error('Failed to calculate breaks');
        return;
      }
      setCb(breaks);

      const jsonData = JSON.parse(new TextDecoder().decode(buffer));
      jsonData.features = jsonData.features.map((feature, i) => ({
        ...feature,
        properties: {
          ...feature.properties,
          jenksCategory: `C${breaks.breaks.findIndex(b => col[i] < b)}`
        }
      }));

      const geoDataProcessed = processGeoJSON(jsonData);

      const dataset = {
        data: {
          fields: geoDataProcessed.fields,
          rows: geoDataProcessed.rows
        },
        info: {id: 'choro_data', label: 'choro data'}
      };

      keplerGlDispatchRef.current(addDataToMap({datasets: [dataset]}));
    };

    fetchDataAndSetLayer();
  }, [choroplethMethod, data, numberOfBreaks, selectedChoroplethVariable]);

  useEffect(() => {
    if (layer && cb) {
      const colorRange = {
        category: 'custom',
        type: 'diverging',
        name: 'ColorBrewer RdBu-5',
        colors: colorbrewer.YlOrBr[cb.breaks.length - 1].map(
          color => `#${color.match(/[0-9a-f]{2}/g).join('')}`
        )
      };

      keplerGlDispatchRef.current(layerVisConfigChange(layer, {colorRange}));

      console.log(jenksIdx);
      keplerGlDispatchRef.current(
        layerVisualChannelConfigChange(
          layer,
          {
            colorField: {
              name: 'jenksCategory',
              type: 'string',
              valueAccessor: function (values) {
                return maybeToDate.bind(null, false, jenksIdx, '', rowContainer)(values);
              }
            }
          },
          'color'
        )
      );
    }
  }, [layer, layers, cb, jenksIdx, rowContainer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
};

export default ChoroplethMap;
