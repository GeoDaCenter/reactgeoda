export const SET_SELECTED_GRAPH_VARIABLES = 'SET_SELECTED_GRAPH_VARIABLES';
export const SET_SELECTED_CHOROPLETH_VARIABLE = 'SET_SELECTED_CHOROPLETH_VARIABLE';
export const SET_PLOT_TYPE = 'SET_PLOT_TYPE';
export const SET_CHOROPLETH_METHOD = 'SET_CHOROPLETH_METHOD';
export const SET_NUMBER_OF_BREAKS = 'SET_NUMBER_OF_BREAKS';
export const SET_SELECTED_LOCAL_MORAN_VARIABLE = 'SET_SELECTED_LOCAL_MORAN_VARIABLE';
export const SET_LOCAL_MORAN_WEIGHTS = 'SET_LOCAL_MORAN_WEIGHTS';
export const SET_LOCAL_MORAN_SIGNIFICANCE = 'SET_LOCAL_MORAN_SIGNIFICANCE';
export const SET_UNIVARIATE_AUTOCORRELATION_TYPE = 'SET_UNIVARIATE_AUTOCORRELATION_TYPE';

export const setSelectedGraphVariables = (variables: string[]) => ({
  type: SET_SELECTED_GRAPH_VARIABLES,
  payload: variables
});

export const setSelectedChoroplethVariable = (variable: string) => ({
  type: SET_SELECTED_CHOROPLETH_VARIABLE,
  payload: variable
});

export const setPlotType = (plotType: string) => ({
  type: SET_PLOT_TYPE,
  payload: plotType
});

export const setChoroplethMethod = (method: string) => ({
  type: SET_CHOROPLETH_METHOD,
  payload: method
});

export const setNumberOfBreaks = (number: number) => ({
  type: SET_NUMBER_OF_BREAKS,
  payload: number
});

export const setSelectedLocalMoranVariable = (variable: string) => ({
  type: SET_SELECTED_LOCAL_MORAN_VARIABLE,
  payload: variable
});

export const setLocalMoranWeights = (weights: string) => ({
  type: SET_LOCAL_MORAN_WEIGHTS,
  payload: weights
});

export const setLocalMoranSignificance = (significance: number) => ({
  type: SET_LOCAL_MORAN_SIGNIFICANCE,
  payload: significance
});

export const setUnivariateAutocorrelationType = (type: string) => ({
  type: SET_UNIVARIATE_AUTOCORRELATION_TYPE,
  payload: type
});
