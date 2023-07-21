import { SET_SELECTED_VARIABLES } from '../actions';

const selectedVariablesReducer = (state = [], action) => {
  switch (action.type) {
    case SET_SELECTED_VARIABLES:
      return action.payload;
    default:
      return state;
  }
};

export default selectedVariablesReducer;
