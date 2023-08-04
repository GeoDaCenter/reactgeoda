import React, {useEffect, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {addDataToMap, forwardTo} from 'kepler.gl/actions';
import KeplerGl from 'kepler.gl';
import jsgeoda from 'jsgeoda';
import {processGeojson} from 'kepler.gl/processors';
import {maybeToDate} from 'kepler.gl/dist/utils';
import {rgbToHex} from 'kepler.gl/dist/utils/color-utils';
import {MAPBOX_TOKEN} from '../constants';

const LocalMoranMap = ({mapId}) => {
  const dispatch = useDispatch();
  const keplerGlDispatch = forwardTo(mapId, dispatch);
  const keplerGlDispatchRef = useRef(keplerGlDispatch);

  const {
    file: {rawFileData: data},
    selectedLocalMoranVariable,
    localMoranWeights,
    localMoranSignificance,
    univariateAutocorrelationType
  } = useSelector(state => state.root);

  const existingLayers = useSelector(state => state.keplerGl[mapId]?.visState?.layers);

  const rows = useSelector(
    state => state?.keplerGl[mapId]?.visState?.datasets?.my_data?.dataContainer?._rows
  );

  const fields = useSelector(state => state?.keplerGl[mapId]?.visState?.datasets?.my_data?.fields);

  useEffect(() => {
    keplerGlDispatchRef.current = keplerGlDispatch;
  }, [keplerGlDispatch]);

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(data));
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
    let lm;
    switch (univariateAutocorrelationType) {
      case 'localMoran':
        lm = geoda.localMoran(w, col, 999, 'lookup', localMoranSignificance, 123456789);
        break;
      case 'localGeary':
        lm = geoda.localGeary(w, col, 999, 'lookup', localMoranSignificance, 123456789);
        break;
      case 'localG':
        lm = geoda.localG(w, col, 999, 'lookup', localMoranSignificance, 123456789);
        break;
      case 'localGStar':
        lm = geoda.localGStar(w, col, 999, 'lookup', localMoranSignificance, 123456789);
        break;
      case 'localJoinCount':
        lm = geoda.localJoinCount(w, col, 999, 'lookup', localMoranSignificance, 123456789);
        break;
      case 'quantileLisa':
        lm = geoda.quantileLisa(w, 5, 1, col, 999, 'lookup', localMoranSignificance, 123456789);
        break;
      default:
        console.error('Invalid autocorrelation type: ' + univariateAutocorrelationType);
        return;
    }

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

    const updatedFields = [...fields, {name: 'clusterCategory', format: '', type: 'string'}];
    const updatedRows = rows.map((row, i) => [...row, `C${lm.clusters[i]}`]);

    const dataset = {
      data: geoDataProcessed,
      info: {id: 'my_data', label: 'my data'}
    };

    const colorRange = {
      category: 'custom',
      type: 'diverging',
      name: 'ColorBrewer RdBu-5',
      colors: lm_colors_hex
    };

    console.log(existingLayers);
    const config = {
      visState: {
        layers: [
          ...existingLayers,
          {
            id: 'moran',
            type: 'geojson',
            config: {
              dataId: 'moran_data',
              label: 'Local Moran Map',
              colorField: {
                name: 'clusterCategory',
                type: 'string'
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
  }, [selectedLocalMoranVariable, localMoranWeights, localMoranSignificance, data]);

  useEffect(() => {
    fetchDataAndSetLayer();
  }, [fetchDataAndSetLayer]);

  return <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />;
};

export default LocalMoranMap;
