import React, {useEffect, useState, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addDataToMap, forwardTo} from 'kepler.gl/actions';
import KeplerGl from 'kepler.gl';
import jsgeoda from 'jsgeoda';
import colorbrewer from 'colorbrewer';
import {processGeojson} from 'kepler.gl/processors';
import {MAPBOX_TOKEN} from '../constants';

function ChoroplethMap({mapId}) {
  const dispatch = useDispatch();
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  const keplerGlDispatchRef = useRef(keplerGlDispatch);

  useEffect(() => {
    keplerGlDispatchRef.current = keplerGlDispatch;
  }, [keplerGlDispatch]);

  const [cb, setCb] = useState(null);

  const choroplethMethod = useSelector(state => state.root.choroplethMethod);
  const numberOfBreaks = useSelector(state => state.root.numberOfBreaks);
  const selectedChoroplethVariable = useSelector(state => state.root.selectedChoroplethVariable);
  const data = useSelector(state => state.root.file.rawFileData);
  const existingLayers = useSelector(state => state.keplerGl[mapId]?.visState?.layers);

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(data));
    const buffer = uint8Array.slice(0);
    const processedData = geoda.readGeoJSON(buffer);
    const col = geoda.getCol(processedData, selectedChoroplethVariable);

    const breaks = await geoda.customBreaks(choroplethMethod, col, numberOfBreaks);

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

    const geoDataProcessed = processGeojson(jsonData);

    const dataset = {
      data: geoDataProcessed,
      info: {id: 'my_data', label: 'my data'}
    };

    const colorRange = {
      category: 'custom',
      type: 'diverging',
      name: 'ColorBrewer RdBu-5',
      colors: colorbrewer.YlOrBr[breaks.breaks.length - 1].map(
        color => `#${color.match(/[0-9a-f]{2}/g).join('')}`
      )
    };

    const config = {
      visState: {
        layers: [
          ...existingLayers,
          {
            id: 'choro',
            type: 'geojson',
            config: {
              dataId: 'my_data',
              label: 'Choropleth Map',
              colorField: {
                name: 'jenksCategory',
                type: 'string',
                valueAccessor: function (values) {
                  return maybeToDate.bind(null, false, jenksIdx, '', rowContainer)(values);
                }
              },
              visConfig: {
                filled: true,
                colorRange,
                stroked: false
              },
              columns: {geojson: '_geojson'},
              isVisible: true
            }
          }
        ]
      }
    };

    keplerGlDispatchRef.current(addDataToMap({datasets: [dataset], config}));
  }, [choroplethMethod, data, numberOfBreaks, selectedChoroplethVariable]);

  useEffect(() => {
    fetchDataAndSetLayer();
  }, [fetchDataAndSetLayer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
}

export default ChoroplethMap;
