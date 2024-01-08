import AutoSizer from 'react-virtualized-auto-sizer';
import KeplerGl from '@kepler.gl/components';
import {MAPBOX_TOKEN} from '../constants';
import {useTheme} from 'styled-components';
import {useDuckDB} from '@/hooks/use-duckdb';

const mapId = 'kepler_map';

// type KeplerMapProps = {
//   dispatch?: any;
//   dataUrl?: string;
// };

const KeplerMap = () => {
  const theme = useTheme();
  useDuckDB();

  return (
    <div style={{height: '100%', padding: '0px'}} className={'geoda-kepler-map'}>
      <AutoSizer defaultHeight={400} defaultWidth={500}>
        {({height, width}) => {
          console.log('height', height, 'width', width);
          return (
            <KeplerGl
              id={mapId}
              mapboxApiAccessToken={MAPBOX_TOKEN}
              height={height}
              width={width}
              theme={theme}
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
