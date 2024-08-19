import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Icons,
  MapControlFactory,
  withState,
  MapControlButton,
  injectComponents
} from '@kepler.gl/components';
import {themeLT, theme as themeDK} from '@kepler.gl/styles';
import {useTheme as useNextTheme} from 'next-themes';

import {MAPBOX_TOKEN, MAP_ID} from '../constants';
import {setKeplerTableModal} from '@/actions';

/**
 * The table control button for the top right corner of the kepler.gl map
 * @param props Function to set the kepler table modal
 * @returns The table control button
 */
function TableControl(props: {setKeplerTableModal: (flag: boolean) => void}) {
  return (
    <div className="ml-[10px] mr-[12px] mt-[20px]">
      <MapControlButton
        className="map-control-button info-panel"
        onClick={e => {
          e.preventDefault();
          props.setKeplerTableModal(true);
        }}
      >
        <Icons.DataTable height="18px" />
      </MapControlButton>
    </div>
  );
}

CustomMapControlFactory.deps = MapControlFactory.deps;
/**
 * The custom map control factory that is used to replace the default map control MapControlFactory
 * @param deps The dependencies for the custom map control factory
 * @returns The custom map control
 */
function CustomMapControlFactory(...deps: any[]) {
  // @ts-ignore FIX type
  const MapControl = MapControlFactory(...deps);

  const CustomMapControl = (props: any) => (
    <div className="absolute right-0 top-0 z-[1]">
      <TableControl {...props} />
      <MapControl {...props} top={0} />
    </div>
  );

  return withState([], state => ({...state.keplerGl}), {setKeplerTableModal})(CustomMapControl);
}

const KeplerGl = injectComponents([[MapControlFactory, CustomMapControlFactory] as never]);

const KeplerMap = () => {
  const {theme} = useNextTheme();

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
