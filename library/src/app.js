import React from 'react';

import AutoSizer from 'react-virtualized-auto-sizer';
import KeplerGl from '@kepler.gl/components';
import { themeLT, theme as themeDK } from '@kepler.gl/styles';
import { useDispatch, useSelector, connect } from 'react-redux';
import { useEffect } from 'react';
import { processFileData, readFileInBatches } from '@kepler.gl/processors';
import { CSVLoader } from '@loaders.gl/csv';
import { ArrowLoader } from '@loaders.gl/arrow';
import { _GeoJSONLoader as GeoJSONLoader } from '@loaders.gl/json';
import { addDataToMap, wrapTo } from '@kepler.gl/actions';

import { MAPBOX_TOKEN, MAP_ID } from '@webgeoda/constants';

const CSV_LOADER_OPTIONS = {
  shape: 'object-row-table',
  dynamicTyping: false, // not working for now
};

const ARROW_LOADER_OPTIONS = {
  shape: 'arrow-table',
};

const JSON_LOADER_OPTIONS = {
  shape: 'object-row-table',
  // instruct loaders.gl on what json paths to stream
  jsonpaths: [
    '$', // JSON Row array
    '$.features', // GeoJSON
    '$.datasets', // KeplerGL JSON
  ],
};

// function to get File object by fetching url
const fetchFileByUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], url.split('/').pop() || '');
  return file;
};

const loaders = [CSVLoader, ArrowLoader, GeoJSONLoader];

const App = ({ dataUrl }) => {
  const dispatch = useDispatch();
  // use selector to get theme
  const theme = useSelector((state) => state.root.uiState.theme);

  // try to load map with dataUrl
  useEffect(() => {
    if (dataUrl) {
      fetchFileByUrl(dataUrl).then(async (file) => {
        const fileCache = [];
        const loadOptions = {
          csv: CSV_LOADER_OPTIONS,
          arrow: ARROW_LOADER_OPTIONS,
          json: JSON_LOADER_OPTIONS,
          metadata: true,
        };

        const batches = await readFileInBatches({
          file,
          fileCache,
          loaders,
          loadOptions,
        });
        let result = await batches.next();
        let content;
        let parsedData = [];

        while (!result.done) {
          console.log('processBatchesUpdater', result.value, result.done);
          content = result.value;
          result = await batches.next();
          if (result.done) {
            parsedData = await processFileData({
              content,
              fileCache: [],
            });
            console.log('parsedData', parsedData);
            break;
          }
        }

        dispatch(
          wrapTo(
            'kepler_map',
            addDataToMap({
              datasets: parsedData[0],
              options: { centerMap: true },
            })
          )
        );
      });
    }
  }, [dataUrl, dispatch]);

  return (
    <div
      style={{ height: '100%', width: '100%', padding: '0px' }}
      className={'geoda-kepler-map'}
    >
      <AutoSizer defaultHeight={400} defaultWidth={500}>
        {({ height, width }) => {
          return (
            <KeplerGl
              id={MAP_ID}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              // getState={(state) => state.keplerGl}
              height={height}
              width={width}
              theme={theme === 'light' ? themeLT : themeDK}
              mint={false}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

const mapStateToProps = (state) => state;
const dispatchToProps = (dispatch) => ({dispatch});
export default connect(mapStateToProps, dispatchToProps)(App);
