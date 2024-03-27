import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';
import {useDispatch, useSelector} from 'react-redux';
import AutoSizer from 'react-virtualized-auto-sizer';
import {useMemo} from 'react';
import {
  appInjector,
  MapContainerFactory,
  makeGetActionCreators,
  mapFieldsSelector,
  MapViewStateContextProvider
} from '@kepler.gl/components';
import {findMapBounds, uiStateUpdaters} from '@kepler.gl/reducers';
import {NO_MAP_ID} from '@kepler.gl/constants';
import {Layer} from '@kepler.gl/layers';
import {themeLT} from '@kepler.gl/styles';
import {wrapTo} from '@kepler.gl/actions';
import {getCenterAndZoomFromBounds, hexToRgb} from '@kepler.gl/utils';

// For inject customized component to kepler.gl
// const KeplerInjector = provideRecipesToInjector([], appInjector);
// const MapContainer = KeplerInjector.get(MapContainerFactory);
const MapContainer = appInjector.get(MapContainerFactory);

const initialMapUiState = {
  // disable all map controls
  mapControls: Object.keys(uiStateUpdaters.DEFAULT_MAP_CONTROLS).reduce(
    (accu, key) => ({
      ...accu,
      [key]: {active: false, show: false}
    }),
    {}
  ),
  // disable side panel
  activeSidePanel: null,
  // disable toggle button
  readonly: true
};

type KeplerMapContainerProps = {
  mapIndex: number;
  mapHeight?: number;
  mapWidth?: number;
  layerId?: string;
};

export function KeplerMapContainer({
  mapIndex,
  mapHeight,
  mapWidth,
  layerId
}: KeplerMapContainerProps) {
  const dispatch = useDispatch();

  const dispatchKepler = (action: any) => dispatch(wrapTo(NO_MAP_ID, action));

  // get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.fileName);

  // keplerStateSelector
  const keplerState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]);

  // // use selector to get theme
  const uiTheme = useSelector((state: any) => state.root.uiState.theme);

  const selectedTheme = uiTheme === 'light' ? themeLT : themeLT;

  // get kepler actions
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions, mapStateActions, uiStateActions, providerActions, mapStyleActions} =
    keplerActionSelector(dispatchKepler, keplerOwnProps);

  // get updated layers
  const updatedLayers = useMemo(() => {
    const layers = keplerState.visState.layers.map((l: Layer) => {
      if (tableName.startsWith(l.config.label)) {
        // l.updateLayerConfig(newLayerConfig?.config);
        return l;
      }
      return l;
    });
    return layers;
  }, [keplerState.visState.layers, tableName]);

  // get splitmaps
  const splitMaps = useMemo(() => {
    const visibleLayers = updatedLayers
      .filter((l: Layer) => l.id === layerId)
      .map((l: Layer) => l.id);
    // convert array to object {[layer.id]: true}
    const layers = visibleLayers?.reduce(
      (accu: {}, layerId: string) => ({
        ...accu,
        [layerId]: true
      }),
      {}
    );
    return new Array(mapIndex + 1)
      .fill(0)
      .map((s, i) => (i === mapIndex ? {layers} : {layers: []}));
  }, [layerId, mapIndex, updatedLayers]);

  const connectedProps = {
    id: MAP_ID,
    // Specify path to keplerGl state, because it is not mounted at the root
    getState: (state: GeoDaState) => state.keplerGl[MAP_ID],
    // width: contentWidth,
    // height: dimensions?.height,
    initialUiState: initialMapUiState,
    mapboxApiAccessToken: '',
    dispatch,
    visStateActions,
    mapStateActions,
    uiStateActions,
    providerActions,
    mapStyleActions,
    visState: {
      ...keplerState?.visState,
      splitMaps,
      layers: keplerState?.visState.layers
        .filter((l: Layer) => l.id === layerId)
        .map((l: Layer) => {
          l.updateLayerConfig({
            isVisible: true
          });
          return l;
        }),
      layerOrder: [layerId],
      layerData: [
        keplerState?.visState.layerData[
          keplerState?.visState.layers.findIndex((l: Layer) => l.id === layerId)
        ]
      ]
    },
    mapState: {
      ...keplerState?.mapState,
      isViewportSynced: false,
      isZoomLocked: false
    },
    uiState: {
      ...keplerState?.uiState,
      ...initialMapUiState
    },
    providerState: keplerState.providerState,
    mapStyle: {
      ...keplerState?.mapStyle,
      styleType: NO_MAP_ID,
      bottomMapStyle: null,
      backgroundColor: hexToRgb(uiTheme === 'light' ? '#FFFFFF' : '#000000')
    }
  };

  const mapFields = mapFieldsSelector(connectedProps, mapIndex);

  return (
    <div className="h-full w-full rounded bg-white dark:bg-black">
      <AutoSizer defaultHeight={280} defaultWidth={300}>
        {({height, width}) => {
          // get center and zoom from bounds for preview map
          const bounds = findMapBounds(mapFields.visState.layers);
          const centerAndZoom = getCenterAndZoomFromBounds(bounds, {width, height});
          const newMapState = {
            ...mapFields.mapState,
            ...(centerAndZoom
              ? {
                  latitude: centerAndZoom.center[1],
                  longitude: centerAndZoom.center[0],
                  ...(Number.isFinite(centerAndZoom.zoom) ? {zoom: centerAndZoom.zoom} : {})
                }
              : {})
          };
          return (
            <div style={{height: height, width: width}} className="rounded p-2">
              <MapViewStateContextProvider mapState={newMapState}>
                <MapContainer
                  width={width}
                  height={height}
                  primary={false}
                  key={mapIndex}
                  index={mapIndex}
                  containerId={mapIndex}
                  theme={selectedTheme}
                  {...mapFields}
                />
              </MapViewStateContextProvider>
            </div>
          );
        }}
      </AutoSizer>
    </div>
    // <div style={{height: '100%', padding: '0px'}} className={'geoda-kepler-map'}>
    //   <AutoSizer defaultHeight={400} defaultWidth={500}>
    //     {({height, width}) => {
    //       return (
    //         <KeplerGl
    //           id={PREVIEW_MAP_ID}
    //           mapboxApiAccessToken=""
    //           height={height}
    //           width={width}
    //           theme={selectedTheme}
    //           initialUiState={initialMapUiState}
    //           mapOnly={true}
    //           mapStyles={[
    //             {
    //               id: 'no_map',
    //               label: 'No Basemap',
    //               url: '',
    //               icon: '',
    //               colorMode: 'NONE',
    //               backgroundColor: 'white',
    //             }
    //           ]}
    //           mapStylesReplaceDefault={true}
    //         />
    //       );
    //     }}
    //   </AutoSizer>
    // </div>
  );
}
