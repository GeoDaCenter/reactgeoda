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

  useEffect(() => {
    keplerGlDispatchRef.current = keplerGlDispatch;
  }, [keplerGlDispatch]);

  const [lm_colors, setCb] = useState(null);

  const data = useSelector(state => state.root.file.rawFileData);
  const layers = useSelector(state => state.keplerGl[mapId]?.visState?.layers);
  const selectedLocalMoranVariable = useSelector(state => state.root.selectedLocalMoranVariable);
  const localMoranWeights = useSelector(state => state.root.localMoranWeights);
  const localMoranSignificance = useSelector(state => state.root.localMoranSignificance);
  const clusterIdx = useSelector(state =>
    state.keplerGl[mapId]?.visState?.datasets?.moran_data?.fields?.findIndex(
      field => field.name === 'clusterCategory'
    )
  );

  const rowContainer = useSelector(
    state => state.keplerGl[mapId]?.visState?.datasets?.moran_data?.dataContainer
  );

  const layer = layers?.[layers.length - 1];

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(data));
    const buffer = uint8Array.slice(0);

    const processedData = geoda.readGeoJSON(buffer);

    let w;

    if (localMoranWeights === 'queen') {
      w = geoda.getQueenWeights(processedData);
    } else if (localMoranWeights === 'rook') {
      w = geoda.getRookWeights(processedData);
    }

    if (
      typeof selectedLocalMoranVariable !== 'string' ||
      !selectedLocalMoranVariable ||
      !localMoranWeights
    ) {
      console.error('local moran vars not defined');
      return;
    }
    const col = geoda.getCol(processedData, selectedLocalMoranVariable);

    const lm = geoda.localMoran(w, col, 999, 'lookup', localMoranSignificance, 123456789);
    const lm_colors = lm.colors.map(c =>
      c
        .toLowerCase()
        .match(/[0-9a-f]{2}/g)
        .map(x => parseInt(x, 16))
    );
    setCb(lm_colors);

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
  }, [data, selectedLocalMoranVariable, localMoranWeights, localMoranSignificance]);

  useEffect(() => {
    fetchDataAndSetLayer();
  }, [fetchDataAndSetLayer]);

  useEffect(() => {
    if (layer && lm_colors) {
      const colorRange = {
        category: 'custom',
        type: 'diverging',
        name: 'ColorBrewer RdBu-5',
        colors: lm_colors
      };

      keplerGlDispatchRef.current(layerVisConfigChange(layer, {colorRange}));

      keplerGlDispatchRef.current(
        layerVisualChannelConfigChange(
          layer,
          {
            colorField: {
              name: 'clusterCategory',
              type: 'string',
              valueAccessor: function (values) {
                return maybeToDate.bind(null, false, clusterIdx, '', rowContainer)(values);
              }
            }
          },
          'color'
        )
      );
    }
  }, [layer, layers, clusterIdx, rowContainer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
};

export default LocalMoranMap;
