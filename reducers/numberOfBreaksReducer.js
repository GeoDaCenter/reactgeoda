// This is for # of breaks for choropleth mapping
import {SET_NUMBER_OF_BREAKS} from '../actions';

const numberOfBreaksReducer = (state = 5, action) => {
  switch (action.type) {
    case SET_NUMBER_OF_BREAKS:
      return action.payload;
    default:
      return state;
  }
};

export default numberOfBreaksReducer;
