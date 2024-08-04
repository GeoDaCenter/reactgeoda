import {
  SPATIAL_JOIN_ACTIONS,
  SpatialAssignActionPayload,
  SpatialCountActionPayload
} from '@/actions/spatial-join-actions';

export type SpatialJoinState = {
  spatialAssign?: SpatialAssignActionPayload;
  spatialCount?: SpatialCountActionPayload;
};

export type SpatialJoinAction = {
  type: string;
  payload: SpatialAssignActionPayload | SpatialCountActionPayload;
};

export const spatialJoinReducer = (state = {}, action: SpatialJoinAction) => {
  switch (action.type) {
    case SPATIAL_JOIN_ACTIONS.RUN_SPATIAL_ASSIGN:
      return {
        ...state,
        spatialAssign: action.payload
      };
    case SPATIAL_JOIN_ACTIONS.RUN_SPATIAL_COUNT:
      return {
        ...state,
        spatialCount: action.payload
      };
    default:
      return state;
  }
};
