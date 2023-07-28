export const SET_SELECTED_GRAPH_VARIABLES = 'SET_SELECTED_GRAPH_VARIABLES';
export const SET_SELECTED_CHOROPLETH_VARIABLE = 'SET_SELECTED_CHOROPLETH_VARIABLE';
export const SET_PLOT_TYPE = 'SET_PLOT_TYPE';
export const SET_CHOROPLETH_METHOD = 'SET_CHOROPLETH_METHOD';
export const SET_NUMBER_OF_BREAKS = 'SET_NUMBER_OF_BREAKS';

export const setSelectedGraphVariables = variables => ({
  type: SET_SELECTED_GRAPH_VARIABLES,
  payload: variables
});

export const setSelectedChoroplethVariable = variable => ({
  type: SET_SELECTED_CHOROPLETH_VARIABLE,
  payload: variable
});

export const setPlotType = plotType => ({
  type: SET_PLOT_TYPE,
  payload: plotType
});

export const setChoroplethMethod = method => ({
  type: SET_CHOROPLETH_METHOD,
  payload: method
});

export const setNumberOfBreaks = number => ({
  type: SET_NUMBER_OF_BREAKS,
  payload: number
});
