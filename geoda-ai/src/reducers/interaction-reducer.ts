import {
  KeplerBrushLinkPayloadProps,
  INTERACTION_ACTIONS,
  GeoDaBrushLinkPayloadProps
} from '@/actions';
import {GeojsonLayer, Layer} from '@kepler.gl/layers';

export type BrushLinkProps = {
  [key: string]: number[];
};

export type KeplerBrushLinkProps = {
  sourceId?: string;
  // brushLink: key is the dataId used in kepler.gl, value is the filtered index
  brushLink: BrushLinkProps;
};

const initialState: KeplerBrushLinkProps = {
  brushLink: {}
};

export type InteractionAction = {
  type: 'BRUSH_LINK_FROM_KEPLER' | 'BRUSH_LINK_FROM_GEODA';
  payload: KeplerBrushLinkPayloadProps | GeoDaBrushLinkPayloadProps;
};

export const interactionReducer = (state = initialState, action: InteractionAction) => {
  switch (action.type) {
    case INTERACTION_ACTIONS.BRUSH_LINK_FROM_KEPLER:
      return keplerBrushLinkUpdater(state, action.payload as KeplerBrushLinkPayloadProps);
    case INTERACTION_ACTIONS.BRUSH_LINK_FROM_GEODA:
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
  state: KeplerBrushLinkProps,
  payload: KeplerBrushLinkPayloadProps
): KeplerBrushLinkProps {
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
    sourceId: 'kepler',
    brushLink
  };
}

function geodaBrushLinkUpdater(
  state: KeplerBrushLinkProps,
  payload: GeoDaBrushLinkPayloadProps
): KeplerBrushLinkProps {
  const {sourceId, dataId, filteredIndex} = payload;
  return {
    ...state,
    sourceId: sourceId,
    brushLink: {
      ...state.brushLink,
      [dataId]: filteredIndex
    }
  };
}
