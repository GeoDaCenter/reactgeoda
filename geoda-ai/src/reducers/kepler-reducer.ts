import {KeplerBrushLinkPayloadProps, KEPLER_ACTIONS, GeoDaBrushLinkPayloadProps} from '@/actions';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';

export type BrushLinkProps = {
  [key: string]: number[];
};

export type KeplerStateProps = {
  brushLink: BrushLinkProps;
};

const initialState: KeplerStateProps = {
  brushLink: {}
};

export type KeplerAction = {
  type: string;
  payload: KeplerBrushLinkPayloadProps | GeoDaBrushLinkPayloadProps;
};

export const keplerReducer = (state = initialState, action: KeplerAction) => {
  switch (action.type) {
    case KEPLER_ACTIONS.BRUSH_LINK_FROM_KEPLER:
      return keplerBrushLinkUpdater(state, action.payload as KeplerBrushLinkPayloadProps);
    case KEPLER_ACTIONS.BRUSH_LINK_FROM_GEODA:
      return geodaBrushLinkUpdater(state, action.payload as GeoDaBrushLinkPayloadProps);
    default:
      return state;
  }
};

// guard function to check if layer is GeoJsonLayer
function isGeoJsonLayer(layer: Layer): layer is GeojsonLayer {
  return layer.type === 'geojson';
}

function keplerBrushLinkUpdater(
  state: KeplerStateProps,
  payload: KeplerBrushLinkPayloadProps
): KeplerStateProps {
  const {layers, editFeature} = payload;

  // get layer ids been used in editFeature
  const layerIds = editFeature.properties.layerIds;

  // get [{datasetId, highlightIds}] from layers which has id in layerIds
  const selectedLayers = layers.filter(l => (layerIds ? layerIds.includes(l.id) : true));

  const brushLink = selectedLayers.reduce((acc: BrushLinkProps, layer: Layer) => {
    const {dataId} = layer.config;
    if (isGeoJsonLayer(layer) && layer.filteredIndexTrigger) {
      acc[dataId] = layer.filteredIndexTrigger;
    }
    return acc;
  }, {});

  return {
    ...state,
    brushLink
  };
}

function geodaBrushLinkUpdater(
  state: KeplerStateProps,
  payload: GeoDaBrushLinkPayloadProps
): KeplerStateProps {
  const {dataId, filteredIndex} = payload;
  return {
    ...state,
    brushLink: {
      ...state.brushLink,
      [dataId]: filteredIndex
    }
  };
}
