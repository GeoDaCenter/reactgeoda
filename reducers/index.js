import { combineReducers } from 'redux';

const languageReducer = (state = 'en', action) => {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return action.payload;
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  language: languageReducer,
  // Will add other reducers
});

export default rootReducer;