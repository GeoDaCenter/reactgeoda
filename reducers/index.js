import { combineReducers } from 'redux';
import languageReducer from './languageReducer';
import fileReducer from './fileReducer';

const rootReducer = combineReducers({
  language: languageReducer,
  file: fileReducer,
  // add other reducers
});

export default rootReducer;
