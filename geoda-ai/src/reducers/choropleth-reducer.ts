import {SET_CHOROPLETH_METHOD} from '../actions';

export type ChoroplethAction = {
  type: string;
  payload: string;
};

const choroplethMethodReducer = (state = '', action: ChoroplethAction) => {
  switch (action.type) {
    case SET_CHOROPLETH_METHOD:
      return action.payload;
    default:
      return state;
  }
};

export default choroplethMethodReducer;
