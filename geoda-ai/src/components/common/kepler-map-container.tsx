'use client';

import {MAP_ID} from '@/constants';
import {GeoDaState} from '@/store';
import {ThemeProvider, styled, withTheme} from 'styled-components';
import {useDispatch, useSelector} from 'react-redux';
import {
  appInjector,
  MapContainerFactory,
  makeGetActionCreators,
  mapFieldsSelector,
  provideRecipesToInjector,
  ContainerFactory,
  MapPopoverFactory
} from '@kepler.gl/components';
import {INITIAL_PROVIDER_STATE, uiStateUpdaters} from '@kepler.gl/reducers';
import {NO_MAP_ID} from '@kepler.gl/constants';
import {Layer} from '@kepler.gl/layers';

import {useMemo, useRef} from 'react';
import {themeLT} from '@kepler.gl/styles';

function getInjectedKepler() {
  const KeplerInjector = provideRecipesToInjector([], appInjector);
  const injectedKepler = KeplerInjector.get(ContainerFactory);
  return {KeplerInjector, injectedKepler};
}
const injected = getInjectedKepler();
export const KeplerInjector = injected.KeplerInjector;

const MapContainer = withTheme(KeplerInjector.get(MapContainerFactory));
KeplerInjector.get(MapPopoverFactory);

const StyledMapContainer = styled.div`
  height: 100%;
  width: 100%;
  test: ${(props: any) => props.theme.mapControl.padding};
`;

const initialMapUiState = {
  mapControls: Object.keys(uiStateUpdaters.DEFAULT_MAP_CONTROLS).reduce(
    (accu, key) => ({
      ...accu,
      [key]: {active: false, show: false}
    }),
    {}
  ),
  activeSidePanel: null
};

type KeplerMapContainerProps = {
  mapIndex: number;
};

function KeplerMapContainer({mapIndex}: KeplerMapContainerProps) {
  const dispatch = useDispatch();

  // get tableName
  const tableName = useSelector((state: GeoDaState) => state.root.file?.rawFileData?.name);

  // keplerStateSelector
  const keplerState = useSelector((state: GeoDaState) => state.keplerGl[MAP_ID]);

  // // use selector to get theme
  const theme = useSelector((state: any) => state.root.uiState.theme);

  const selectedTheme = theme === 'light' ? themeLT : themeLT;

  // get kepler actions
  const keplerActionSelector = makeGetActionCreators();
  const keplerOwnProps = {};
  const {visStateActions, mapStateActions, uiStateActions, providerActions, mapStyleActions} =
    keplerActionSelector(dispatch, keplerOwnProps);

  // get splitmaps
  const splitMaps = useMemo(() => {
    const visibleLayers = keplerState.visState.layers
      .filter((l: Layer) => tableName.startsWith(l.config.label))
      .map((l: Layer) => l.id);
    // array to object {[layer.id]: true}
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
  }, [keplerState.visState.layers, mapIndex, tableName]);

  const connectedProps = {
    id: MAP_ID,
    // Specify path to keplerGl state, because it is not mounted at the root
    getState: (state: GeoDaState) => state.keplerGl[MAP_ID],
    // width: contentWidth,
    // height: dimensions?.height,
    theme: selectedTheme,
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
      splitMaps
    },
    mapState: {
      ...keplerState?.mapState
    },
    uiState: {
      ...keplerState?.uiState,
      ...initialMapUiState
    },
    providerState: INITIAL_PROVIDER_STATE,
    mapStyle: {
      ...keplerState?.mapStyle,
      styleType: NO_MAP_ID
    }
  };

  const mapFields = mapFieldsSelector(connectedProps, mapIndex);
  const rootNode = useRef<HTMLDivElement>(null);

  // copy datasets
  // const newDatasets = useMemo(() => {
  //   Object.keys(keplerState.visState.datasets).reduce((accu: {}, key: string) => {
  //     accu[key] = copyTableAndUpdate(keplerState.visState.datasets[key]);
  //     return accu;
  //   }, {});
  // }, [keplerState.visState.datasets]);

  return (
    // <ThemeProvider theme={selectedTheme}>
    <StyledMapContainer>
      <MapContainer
        primary={true}
        key={mapIndex}
        index={mapIndex}
        containerId={mapIndex}
        {...mapFields}
        theme={selectedTheme}
      />
    </StyledMapContainer>
    // </ThemeProvider>

    // <div style={{height: '100%', padding: '0px'}} className={'geoda-kepler-map'}>
    //   <AutoSizer defaultHeight={400} defaultWidth={500}>
    //     {({height, width}) => {
    //       return (
    //         <KeplerGl
    //           id={PREVIEW_MAP_ID}
    //           mapboxApiAccessToken=""
    //           height={height}
    //           width={width}
    //           theme={theme}
    //           initialUiState={initialMapUiState}
    //         />
    //       );
    //     }}
    //   </AutoSizer>
    // </div>
  );
}

export default KeplerMapContainer;
