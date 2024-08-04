import {CreateMapPayloadProps, MAPS_ACTIONS} from '@/actions';

export type MapProps = {
  dataId: string;
  layerId: string;
};

const initialState: MapProps[] = [];

export type MapsAction = {
  type: string;
  payload: CreateMapPayloadProps;
};

export const mapsReducer = (state = initialState, action: MapsAction) => {
  switch (action.type) {
    case MAPS_ACTIONS.CREATE_MAP:
      return state;
    default:
      return state;
  }
};
