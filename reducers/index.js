import { combineReducers } from 'redux';
import languageReducer from './languageReducer';
import fileReducer from './fileReducer';
import selectedVariablesReducer from './selectedVariablesReducer';
import plotTypeReducer from './plotTypeReducer';

const rootReducer = combineReducers({
  language: languageReducer,
  file: fileReducer,
  selectedVariable: selectedVariablesReducer,
  plotType: plotTypeReducer,
});

export default rootReducer;
