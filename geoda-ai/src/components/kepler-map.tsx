import AutoSizer from 'react-virtualized-auto-sizer';
import KeplerGl from '@kepler.gl/components';
import {themeLT, theme as themeDK} from '@kepler.gl/styles';

import {useGeoDa} from '@/hooks/use-geoda';
import {MAPBOX_TOKEN, MAP_ID} from '../constants';
import {useSelector} from 'react-redux';
import {GeoDaState} from '@/store';

const KeplerMap = () => {
  // use selector to get theme
  const theme = useSelector((state: GeoDaState) => state.root.uiState.theme);

  // trigger use hooks to load wasm files
  useGeoDa();

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
              // when a `KeplerGl` component is unmounted, don't remove the map from the DOM
              mint={false}
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
