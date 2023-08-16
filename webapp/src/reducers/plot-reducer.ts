import {SET_PLOT_TYPE} from '../actions';

export type PlotAction = {
  type: string;
  payload: any;
};

const plotTypeReducer = (state = '', action: PlotAction) => {
  switch (action.type) {
    case SET_PLOT_TYPE:
      return action.payload;
    default:
      return state;
  }
};

export default plotTypeReducer;
