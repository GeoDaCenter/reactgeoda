import {SET_CHOROPLETH_METHOD} from '../actions';

const choroplethMethodReducer = (state = '', action) => {
  switch (action.type) {
    case SET_CHOROPLETH_METHOD:
      return action.payload;
    default:
      return state;
  }
};

export default choroplethMethodReducer;
