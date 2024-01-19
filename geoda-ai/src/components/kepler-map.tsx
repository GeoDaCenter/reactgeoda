import AutoSizer from 'react-virtualized-auto-sizer';
import KeplerGl from '@kepler.gl/components';
import {useTheme} from 'styled-components';
import {useDuckDB} from '@/hooks/use-duckdb';
import {useGeoDa} from '@/hooks/use-geoda';
import {MAPBOX_TOKEN, MAP_ID} from '../constants';

// type KeplerMapProps = {
//   dispatch?: any;
//   dataUrl?: string;
// };

const KeplerMap = () => {
  const theme = useTheme();
  useDuckDB();
  useGeoDa();

  return (
    <div style={{height: '100%', padding: '0px'}} className={'geoda-kepler-map'}>
      <AutoSizer defaultHeight={400} defaultWidth={500}>
        {({height, width}) => {
          console.log('height', height, 'width', width);
          return (
            <KeplerGl
              id={MAP_ID}
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
