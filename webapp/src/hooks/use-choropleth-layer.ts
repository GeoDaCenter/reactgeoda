import jsgeoda from 'jsgeoda';
import colorbrewer from 'colorbrewer';
import {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'geojson';
import {setChoroplethData, setChoroplethLayer} from '../actions';
import {GeoDaState} from '../store';

function useChoroplethLayer() {
  const dispatch = useDispatch();
  const choroplethMethod = useSelector((state: GeoDaState) => state.root.choroplethMethod);
  const numberOfBreaks = useSelector((state: GeoDaState) => state.root.numberOfBreaks);
  const selectedChoroplethVariable = useSelector(
    (state: GeoDaState) => state.root.selectedChoroplethVariable
  );
  const data = useSelector((state: GeoDaState) => state.root.file.rawFileData);

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

    const jsonData = JSON.parse(new TextDecoder().decode(buffer));
    jsonData.features = jsonData.features.map((feature: Feature, i: number) => ({
      ...feature,
      properties: {
        ...feature.properties,
        jenksCategory: `C${breaks.breaks.findIndex((b: number) => col[i] < b)}`
      }
    }));

    const colorRange = {
      category: 'custom',
      type: 'diverging',
      name: 'ColorBrewer RdBu-5',
      colors: colorbrewer.YlOrBr[breaks.breaks.length - 1].map(
        color => `#${color.match(/[0-9a-f]{2}/g)?.join('')}`
      )
    };

    const layer = {
      id: 'choro',
      type: 'geojson',
      config: {
        dataId: 'my_data',
        label: 'Choropleth Map',
        color: [255, 0, 0], 
        isConfigActive: true, 
        highlightColor: [255, 0, 0, 128],
        hidden: false,
        colorUI: {
          color: { customPalette: {}, showSketcher: false, showDropdown: false, colorRangeConfig: { type: '', steps: 0, reversed: false, custom: false } },
          colorRange: { customPalette: {}, showSketcher: false, showDropdown: false, colorRangeConfig: { type: '', steps: 0, reversed: false, custom: false } }
        }, 
        animation: { enabled: false }, 
        textLabel: [], 
        colorField: {
          name: 'jenksCategory',
          type: 'string'
        },
        visConfig: {
          filled: true,
          colorRange: {
            category: 'custom',
            type: 'diverging',
            name: 'ColorBrewer RdBu-5',
            colors: colorbrewer.YlOrBr[breaks.breaks.length - 1].map(
              color => `#${color.match(/[0-9a-f]{2}/g)?.join('')}`
            )
          },
          stroked: false,
        },
        columns: { geojson: '_geojson' },
        isVisible: true,
      }
    };

    const jenksCategory = jsonData.features.map(
      (feature: Feature, i: number) => `C${breaks.breaks.findIndex((b: number) => col[i] < b)}`
    );
    dispatch(setChoroplethLayer(layer));
    dispatch(setChoroplethData(jenksCategory));
  }, [choroplethMethod, data, dispatch, numberOfBreaks, selectedChoroplethVariable]);

  return {fetchDataAndSetLayer};
}

export default useChoroplethLayer;
