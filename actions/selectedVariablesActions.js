export const SET_SELECTED_VARIABLES = 'SET_SELECTED_VARIABLES';
export const SET_PLOT_TYPE = 'SET_PLOT_TYPE';

export const setSelectedVariables = variables => ({
  type: SET_SELECTED_VARIABLES,
  payload: variables
});

export const setPlotType = plotType => ({
  type: SET_PLOT_TYPE,
  payload: plotType
});
