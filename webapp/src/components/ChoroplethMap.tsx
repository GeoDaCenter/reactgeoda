// TODO: get shapefile rawdata working. Fix valueaccessor part
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  addDataToMap,
  layerVisualChannelConfigChange,
  layerVisConfigChange,
  forwardTo
} from '@kepler.gl/actions';
import KeplerGl from '@kepler.gl/components';
import {processGeojson} from '@kepler.gl/processors';
// @ts-ignore
import jsgeoda from 'jsgeoda';
import colorbrewer from 'colorbrewer';
import {MAPBOX_TOKEN} from '../constants';

const mapId = 'choropleth_map';

const ChoroplethMap = () => {
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
  const layers = useSelector(state => state.keplerGl[mapId]?.visState?.layers);

  const jenksIdx = useSelector(state =>
    state.keplerGl[mapId]?.visState?.datasets?.choro_data?.fields?.findIndex(
      field => field.name === 'jenksCategory'
    )
  );

  const rowContainer = useSelector(
    state => state.keplerGl[mapId]?.visState?.datasets?.choro_data?.dataContainer
  );

  const layer = layers?.[layers.length - 1];

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(data));
    const buffer = uint8Array.slice(0);

    const processedData = geoda.readGeoJSON(buffer);

    if (typeof selectedChoroplethVariable !== 'string') {
      console.error('selectedChoroplethVariable must be a string');
      return;
    }

    const col = geoda.getCol(processedData, selectedChoroplethVariable);

    if (!col) {
      console.error('Invalid column selected');
      return;
    }

    console.log(processedData);
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
      data: {
        fields: geoDataProcessed.fields,
        rows: geoDataProcessed.rows
      },
      info: {id: 'choro_data', label: 'choro data'}
    };

    keplerGlDispatchRef.current(addDataToMap({datasets: [dataset]}));
  }, [choroplethMethod, data, numberOfBreaks, selectedChoroplethVariable]);

  useEffect(() => {
    fetchDataAndSetLayer();
  }, [fetchDataAndSetLayer]);

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
      console.log(colorRange);
      keplerGlDispatchRef.current(layerVisConfigChange(layer, {colorRange}));

      keplerGlDispatchRef.current(
        layerVisualChannelConfigChange(
          layer,
          {
            colorField: {
              name: 'jenksCategory',
              type: 'string'
            }
          },
          'color'
        )
      );
    }
  }, [layer, cb, jenksIdx, rowContainer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
};

export default ChoroplethMap;
