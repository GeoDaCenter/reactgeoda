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
import {processGeojson} from 'kepler.gl/dist/processors';
import {maybeToDate} from 'kepler.gl/dist/utils';
import {rgbToHex} from 'kepler.gl/dist/utils/color-utils';
import {MAPBOX_TOKEN} from '../constants';

const mapId = 'local_moran_map';

const LocalMoranMap = () => {
  const dispatch = useDispatch();
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  const keplerGlDispatchRef = useRef(keplerGlDispatch);

  const {
    file: {rawFileData: data},
    selectedLocalMoranVariable,
    localMoranWeights,
    localMoranSignificance
  } = useSelector(state => state.root);

  const kepler = useSelector(state => state.keplerGl[mapId]?.visState);

  const dataRef = useRef();
  const clusterIdxRef = useRef();
  const rowContainerRef = useRef();

  dataRef.current = data;
  clusterIdxRef.current = kepler?.datasets?.moran_data?.fields?.findIndex(
    field => field.name === 'clusterCategory'
  );
  rowContainerRef.current = kepler?.datasets?.moran_data?.dataContainer;

  const layers = kepler?.layers;
  const layer = layers?.[layers.length - 1];

  useEffect(() => {
    keplerGlDispatchRef.current = keplerGlDispatch;
  }, [keplerGlDispatch]);

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(dataRef.current));
    const buffer = uint8Array.slice(0);
    const processedData = geoda.readGeoJSON(buffer);

    let w =
      localMoranWeights === 'queen'
        ? geoda.getQueenWeights(processedData)
        : geoda.getRookWeights(processedData);

    if (!selectedLocalMoranVariable || !localMoranWeights) {
      console.error('local moran vars not defined');
      return;
    }

    const col = geoda.getCol(processedData, selectedLocalMoranVariable);
    const lm = geoda.localMoran(w, col, 999, 'lookup', localMoranSignificance, 123456789);
    const lm_colors_hex = lm.colors.map(c =>
      rgbToHex(
        c
          .toLowerCase()
          .match(/[0-9a-f]{2}/g)
          .map(x => parseInt(x, 16))
      )
    );

    const jsonData = JSON.parse(new TextDecoder().decode(buffer));
    jsonData.features = jsonData.features.map((feature, i) => ({
      ...feature,
      properties: {
        ...feature.properties,
        clusterCategory: `C${lm.clusters[i]}`
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

    if (layer) {
      const colorRange = {
        category: 'custom',
        type: 'diverging',
        name: 'ColorBrewer RdBu-5',
        colors: lm_colors_hex
      };

      keplerGlDispatchRef.current(layerVisConfigChange(layer, {colorRange, stroked: false}));
      keplerGlDispatchRef.current(
        layerVisualChannelConfigChange(
          layer,
          {
            colorField: {
              name: 'clusterCategory',
              type: 'string',
              valueAccessor: function (values) {
                return maybeToDate.bind(
                  null,
                  false,
                  clusterIdxRef.current,
                  '',
                  rowContainerRef.current
                )(values);
              }
            }
          },
          'color'
        )
      );
    }
  }, [layer, selectedLocalMoranVariable, localMoranWeights, localMoranSignificance]);

  useEffect(() => {
    fetchDataAndSetLayer();
  }, [fetchDataAndSetLayer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
};

export default LocalMoranMap;
