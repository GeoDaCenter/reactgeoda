import {PLOT_ACTIONS, PlotProps, RemovePlotProps} from '@/actions/plot-actions';

const initialState: Array<any> = [];

export type PlotAction = {
  type: string;
  payload: PlotProps | RemovePlotProps;
};

export const plotReducer = (state = initialState, action: PlotAction) => {
  switch (action.type) {
    case PLOT_ACTIONS.ADD_PLOT:
      return [...state, action.payload];
    case PLOT_ACTIONS.REMOVE_PLOT:
      return state.filter(plot => plot.id !== action.payload);
    default:
      return state;
  }
};
