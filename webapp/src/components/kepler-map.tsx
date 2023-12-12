import {useEffect, useCallback, useRef} from 'react';
import {connect, useSelector} from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import KeplerGl from '@kepler.gl/components';
import {addDataToMap, forwardTo, loadFiles} from '@kepler.gl/actions';
import {Field, RowData, ProtoDataset, ProcessorResult} from '@kepler.gl/types';
import {MAPBOX_TOKEN} from '../constants';
import useChoroplethLayer from '../hooks/use-choropleth-layer';
import useLocalMoranLayer from '../hooks/use-localmoran-layer';
import {GeoDaState} from '../store';

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

type KeplerMapProps = {
  dispatch: any;
  dataUrl?: string;
};

const KeplerMap = ({dispatch, dataUrl}: KeplerMapProps) => {
  const keplerGlDispatch = useCallback(
    (action: any) => forwardTo(mapId, dispatch)(action),
    [dispatch]
  );
  const {
    file: {fileData: data},
    choroplethLayer,
    choroplethData: jenksCategory,
    localMoranLayer,
    localMoranData: clusterCategory
  } = useSelector((state: GeoDaState) => state.root);

  const layerFields = useSelector(
    (state: GeoDaState) => state?.keplerGl[mapId]?.visState?.datasets?.my_data?.fields
  );
  const layerRows = useSelector(
    (state: GeoDaState) => state?.keplerGl[mapId]?.visState?.datasets?.my_data?.dataContainer?._rows
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
      const fields = data.fields.map((field: Field) => ({
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

  const layerFieldsRef = useRef<Field[]>();
  const layerRowsRef = useRef<RowData[]>();
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
        (field: Field) => field.name === 'clusterCategory'
      );
      const jenksCategoryIndex = layerFieldsRef.current.findIndex(
        (field: Field) => field.name === 'jenksCategory'
      );
      if (jenksCategoryIndex >= 0 && clusterCategoryIndex >= 0) {
        const updatedLayerRows = layerRowsRef.current?.map((row, i) => {
          // replace the values in the jenks and cluster cols (default 'N/A')
          const newRow = [...row];
          newRow[jenksCategoryIndex] = jenksCategory[i] || 'N/A';
          newRow[clusterCategoryIndex] = clusterCategory[i] || 'N/A';
          return newRow;
        });

        if (updatedLayerRows) {
          const newDataset: ProtoDataset = {
            data: {
              fields: layerFieldsRef.current,
              rows: updatedLayerRows
            },
            info: {id: 'my_data', label: 'my data'}
          };
          keplerGlDispatch(
            addDataToMap({datasets: newDataset, config: config, options: {readOnly: true}})
          );
        }
      } else {
        console.error('jenksCategory or clusterCategory not defined');
      }
    }
  }, [choroplethLayer, jenksCategory, localMoranLayer, clusterCategory, keplerGlDispatch]);

  const addDataToKeplerGl = useCallback(
    (parsedData: ProcessorResult, info?: Record<string, any>) => {
      if (parsedData) {
        keplerGlDispatch(
          addDataToMap({
            datasets: {data: parsedData, info: info || {}},
            options: {centerMap: true, readOnly: false}
          })
        );
      }
    },
    [keplerGlDispatch]
  );

  // component mount with geojsonUrl or csvUrl
  useEffect(() => {
    // get File object by fetching url
    const fetchFileByUrl = async (url: string) => {
      const response = await fetch(url);
      const blob = await response.blob();
      const file = new File([blob], url.split('/').pop() || '');
      return file;
    };

    if (dataUrl) {
      fetchFileByUrl(dataUrl).then(file => {
        keplerGlDispatch(loadFiles([file]));
      });
    }
  }, [dataUrl, keplerGlDispatch, addDataToKeplerGl]);

  return (
    <div style={{height: '100vh', padding: '16px'}} className={'geoda-kepler-map'}>
      <AutoSizer defaultHeight={400} defaultWidth={500}>
        {({height, width}) => {
          return (
            <KeplerGl
              id={mapId}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              height={height}
              width={width}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

const mapStateToProps = (state: GeoDaState) => state;

const dispatchToProps = (dispatch: any) => ({dispatch});

// connect a React component to Redux store
// data it needs from the store
// function it can use to dispatch actions to the store
export default connect(mapStateToProps, dispatchToProps)(KeplerMap);
