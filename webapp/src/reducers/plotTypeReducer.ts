import {SET_PLOT_TYPE} from '../actions';

const plotTypeReducer = (state = '', action: any) => {
  switch (action.type) {
    case SET_PLOT_TYPE:
      return action.payload;
    default:
      return state;
  }
};

export default plotTypeReducer;
