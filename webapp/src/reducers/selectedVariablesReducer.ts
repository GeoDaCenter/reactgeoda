import {SET_SELECTED_GRAPH_VARIABLES, SET_SELECTED_CHOROPLETH_VARIABLE} from '../actions';

export const selectedGraphVariablesReducer = (state = [], action: any) => {
  switch (action.type) {
    case SET_SELECTED_GRAPH_VARIABLES:
      return action.payload;
    default:
      return state;
  }
};

export const selectedChoroplethVariableReducer = (state = '', action: any) => {
  switch (action.type) {
    case SET_SELECTED_CHOROPLETH_VARIABLE:
      return action.payload;
    default:
      return state;
  }
};
