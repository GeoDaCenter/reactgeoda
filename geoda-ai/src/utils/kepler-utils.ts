import {GeoDaBrushLinkPayloadProps} from '@/actions';
import {InteractionAction} from '@/reducers/interaction-reducer';
import {Layer} from '@kepler.gl/layers';
import {KeplerGlState} from '@kepler.gl/reducers';
import {Filter} from '@kepler.gl/types';
import {UnknownAction} from 'redux';

// type guard function to check if payload is GeoDaBrushLinkPayloadProps
function isGeoDaBrushLinkPayloadProps(payload: any): payload is GeoDaBrushLinkPayloadProps {
  return payload.dataId && payload.filteredIndex;
}

export function isInteractionAction(action: UnknownAction): action is InteractionAction {
  return action.type === 'BRUSH_LINK_FROM_GEODA' || action.type === 'BRUSH_LINK_FROM_KEPLER';
}

export function handleGeoDaBrushLink(state: KeplerGlState, action: UnknownAction) {
  if (!isInteractionAction(action)) {
    return state;
  }
  if (!isGeoDaBrushLinkPayloadProps(action.payload)) {
    return state;
  }

  const {sourceId, dataId, filteredIndex} = action.payload;
  if (sourceId === 'kepler') {
    return state;
  }

  const visState = state.visState;
  const datasets = visState.datasets;
  const dataset = datasets[dataId];

  if (filteredIndex) {
    dataset.filteredIndex = filteredIndex.length === 0 ? dataset.allIndexes : filteredIndex;
    const layers = visState.layers.filter((l: Layer) => l.config.dataId === dataId);
    layers.forEach((l: Layer) => {
      l.formatLayerData(datasets);
    });
  }

  // remove filters that typ is polygon
  visState.filters = visState.filters.filter((f: Filter) => f.type !== 'polygon');

  // remove the edit feature
  visState.editor = {
    ...visState.editor,
    features: [],
    selectedFeature: null
  };

  return {
    ...state
  };
}
