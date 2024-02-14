import AutoSizer from 'react-virtualized-auto-sizer';
import KeplerGl from '@kepler.gl/components';
import {themeLT, theme as themeDK} from '@kepler.gl/styles';

import {getTableSummary, useDuckDB} from '@/hooks/use-duckdb';
import {useGeoDa} from '@/hooks/use-geoda';
import {MAPBOX_TOKEN, MAP_ID} from '../constants';
import {useSelector} from 'react-redux';
import {useEffect} from 'react';

const KeplerMap = () => {
  // use selector to get theme
  const theme = useSelector((state: any) => state.root.uiState.theme);

  // use selector to get table name
  const rawFileData = useSelector((state: any) => state.root.file?.rawFileData);

  // trigger use hooks to load wasm files
  const {importArrowFile} = useDuckDB();
  useGeoDa();

  // try to create a summary of the data
  useEffect(() => {
    if (rawFileData?.name) {
      importArrowFile(rawFileData);
      getTableSummary(rawFileData.name);
    }
  }, [importArrowFile, rawFileData]);

  return (
    <div style={{height: '100%', padding: '0px'}} className={'geoda-kepler-map'}>
      <AutoSizer defaultHeight={400} defaultWidth={500}>
        {({height, width}) => {
          return (
            <KeplerGl
              id={MAP_ID}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              height={height}
              width={width}
              theme={theme === 'light' ? themeLT : themeDK}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

// const mapStateToProps = (state: GeoDaState) => state;

// const dispatchToProps = (dispatch: any) => ({dispatch});

// connect a React component to Redux store
// data it needs from the store
// function it can use to dispatch actions to the store
// export default connect(mapStateToProps, dispatchToProps)(KeplerMap);

export default KeplerMap;
