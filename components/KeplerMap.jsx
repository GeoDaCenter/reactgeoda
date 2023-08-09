import React, {useEffect, useCallback, useRef} from 'react';
import {connect, useSelector} from 'react-redux';
import KeplerGl from 'kepler.gl';
import {addDataToMap, forwardTo} from 'kepler.gl/actions';
import {processGeojson} from 'kepler.gl/processors';
import {MAPBOX_TOKEN} from '../constants';
import useChoroplethLayer from '../hooks/useChoroplethLayer';
import useLocalMoranLayer from '../hooks/useLocalMoranLayer';

const mapId = 'kepler_map';

const defaultLayer = {
  id: 'defaultLayer',
  type: 'geojson',
  config: {
    dataId: 'my_data',
    label: 'Default Map',
    color: [135, 206, 250], // Sky Blue
    visConfig: {
      filled: true,
      stroked: true,
      strokeColor: [255, 127, 80, 255] // Coral
    },
    columns: {geojson: '_geojson'},
    isVisible: false
  }
};

const KeplerMap = ({dispatch, geojsonUrl}) => {
  const keplerGlDispatch = useCallback(action => forwardTo(mapId, dispatch)(action), [dispatch]);
  const {
    file: {fileData: data},
    choroplethLayer,
    choroplethData: jenksCategory,
    localMoranLayer,
    localMoranData: clusterCategory
  } = useSelector(state => state.root);

  const layerFields = useSelector(
    state => state?.keplerGl[mapId]?.visState?.datasets?.my_data?.fields
  );
  const layerRows = useSelector(
    state => state?.keplerGl[mapId]?.visState?.datasets?.my_data?.dataContainer?._rows
  );

  const {fetchDataAndSetLayer: fetchChoroplethLayer} = useChoroplethLayer();
  const {fetchDataAndSetLayer: fetchLocalMoranLayer} = useLocalMoranLayer();

  useEffect(() => {
    fetchChoroplethLayer();
  }, [fetchChoroplethLayer]);

  useEffect(() => {
    fetchLocalMoranLayer();
  }, [fetchLocalMoranLayer]);

  useEffect(() => {
    if (data && data.fields && data.rows) {
      const fields = data.fields.map(field => ({
        name: field.name,
        format: field.format,
        type: field.type,
        id: field.id
      }));

      const updatedFields = [
        ...fields,
        {name: 'jenksCategory', format: '', type: 'string'},
        {name: 'clusterCategory', format: '', type: 'string'}
      ];

      const updatedRows = data.rows.map(row => [...row, 'N/A', 'N/A']);

      const dataset = {
        info: {id: 'my_data', label: 'my data'},
        data: {fields: updatedFields, rows: updatedRows}
      };

      keplerGlDispatch(addDataToMap({datasets: dataset}));
    }
  }, [data, keplerGlDispatch]);

  const layerFieldsRef = useRef();
  const layerRowsRef = useRef();
  useEffect(() => {
    layerFieldsRef.current = layerFields;
    layerRowsRef.current = layerRows;
  }, [layerFields, layerRows]);

  useEffect(() => {
    if (
      choroplethLayer &&
      jenksCategory &&
      clusterCategory &&
      localMoranLayer &&
      layerFieldsRef.current
    ) {
      const config = {
        visState: {
          filters: [],
          layers: [defaultLayer, choroplethLayer, localMoranLayer],
          layerBlending: 'normal'
        }
      };

      const clusterCategoryIndex = layerFieldsRef.current.findIndex(
        field => field.name === 'clusterCategory'
      );
      const jenksCategoryIndex = layerFieldsRef.current.findIndex(
        field => field.name === 'jenksCategory'
      );
      if (jenksCategoryIndex >= 0 && clusterCategoryIndex >= 0) {
        const updatedLayerRows = layerRowsRef.current.map((row, i) => {
          // replace the values in the jenks and cluster cols (default 'N/A')
          const newRow = [...row];
          newRow[jenksCategoryIndex] = jenksCategory[i] || 'N/A';
          newRow[clusterCategoryIndex] = clusterCategory[i] || 'N/A';
          return newRow;
        });

        const newDataset = {
          data: {
            fields: layerFieldsRef.current,
            rows: updatedLayerRows
          },
          info: {id: 'my_data', label: 'my data'}
        };
        keplerGlDispatch(addDataToMap({datasets: newDataset, config: config}));
      } else {
        console.error('jenksCategory or clusterCategory not defined');
      }
    }
  }, [choroplethLayer, jenksCategory, localMoranLayer, clusterCategory, keplerGlDispatch]);

  useEffect(() => {
    if (geojsonUrl) {
      fetch(geojsonUrl)
        .then(response => response.json())
        .then(data => {
          keplerGlDispatch(
            addDataToMap({
              datasets: {data: processGeojson(data)},
              options: {centerMap: true, readOnly: true}
            })
          );
        });
    }
  }, [geojsonUrl, keplerGlDispatch]);

  return (
    <div>
      <KeplerGl id={mapId} mapboxApiAccessToken={MAPBOX_TOKEN} width={700} height={700} />
    </div>
  );
};

const mapStateToProps = state => ({
  data: state.root.file.fileData
});

export default connect(mapStateToProps)(KeplerMap);
