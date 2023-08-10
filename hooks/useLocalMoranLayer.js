import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import jsgeoda from 'jsgeoda';
import {rgbToHex} from 'kepler.gl/dist/utils/color-utils';
import {setLocalMoranLayer, setLocalMoranData} from '../actions';

const LocalMoranLayer = () => {
  const dispatch = useDispatch();
  const {
    file: {rawFileData: data},
    selectedLocalMoranVariable,
    localMoranWeights,
    localMoranSignificance,
    univariateAutocorrelationType
  } = useSelector(state => state.root);

  const fetchDataAndSetLayer = useCallback(async () => {
    const geoda = await jsgeoda.New();
    const uint8Array = new TextEncoder().encode(JSON.stringify(data));
    const buffer = uint8Array.slice(0);
    const processedData = geoda.readGeoJSON(buffer);

    const col = geoda.getCol(processedData, selectedLocalMoranVariable);
    let w =
      localMoranWeights === 'queen'
        ? geoda.getQueenWeights(processedData)
        : geoda.getRookWeights(processedData);

    if (!selectedLocalMoranVariable || !localMoranWeights) {
      console.error('local moran vars not defined');
      return;
    }

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

    const colorRange = {
      category: 'custom',
      type: 'diverging',
      name: 'ColorBrewer RdBu-5',
      colors: lm_colors_hex
    };

    const clusterCategory = lm.clusters.map(cluster => `C${cluster}`);
    const layer = {
      id: 'moran',
      type: 'geojson',
      config: {
        dataId: 'my_data',
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
    };

    dispatch(setLocalMoranLayer(layer));
    dispatch(setLocalMoranData(clusterCategory));
  }, [
    selectedLocalMoranVariable,
    localMoranWeights,
    localMoranSignificance,
    univariateAutocorrelationType
  ]);

  return {fetchDataAndSetLayer};
};

export default LocalMoranLayer;
