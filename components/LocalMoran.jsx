import React, {useEffect, useCallback, useRef} from 'react';
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
const mapId = 'local_moran_map';

const LocalMoranMap = () => {
  const dispatch = useDispatch();
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  const keplerGlDispatchRef = useRef(keplerGlDispatch);

  const data = useSelector(state => state.root.file.rawFileData);
  const layers = useSelector(state => state.keplerGl[mapId]?.visState?.layers);

  const rowContainer = useSelector(
    state => state.keplerGl[mapId]?.visState?.datasets?.moran_data?.dataContainer
  );

  const layer = layers?.[layers.length - 1];

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(data));
    const buffer = uint8Array.slice(0);

    const processedData = geoda.read_geojson(buffer);
    const w = geoda.get_queen_weights(processedData);
    const variableValues = geoda.get_column(processedData, 'variableName'); // replace 'variableName' with the name of the variable for which local Moran's I is calculated

    const localMoranResults = geoda.local_moran(w, variableValues, 999, 'lookup', 0.05, 123456789);

    const jsonData = JSON.parse(new TextDecoder().decode(buffer));
    jsonData.features = jsonData.features.map((feature, i) => ({
      ...feature,
      properties: {
        ...feature.properties,
        clusterCategory: `C${localMoranResults.clusters[i]}`
      }
    }));

    const geoDataProcessed = processGeojson(jsonData);

    const dataset = {
      data: {
        fields: geoDataProcessed.fields,
        rows: geoDataProcessed.rows
      },
      info: {id: 'moran_data', label: 'moran data'}
    };

    keplerGlDispatchRef.current(addDataToMap({datasets: [dataset]}));
  }, [data]);

  useEffect(() => {
    fetchDataAndSetLayer();
  }, [fetchDataAndSetLayer]);

  useEffect(() => {
    if (layer) {
      const colorRange = {
        category: 'custom',
        type: 'diverging',
        name: 'ColorBrewer RdBu-5',
        colors: colorbrewer.YlOrBr[5]
      };

      keplerGlDispatchRef.current(layerVisConfigChange(layer, {colorRange}));

      keplerGlDispatchRef.current(
        layerVisualChannelConfigChange(
          layer,
          {
            colorField: {
              name: 'clusterCategory',
              type: 'string'
            }
          },
          'color'
        )
      );
    }
  }, [layer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
};

export default LocalMoranMap;
