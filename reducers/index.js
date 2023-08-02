import {combineReducers} from 'redux';
import languageReducer from './languageReducer';
import fileReducer from './fileReducer';
import {
  selectedGraphVariablesReducer,
  selectedChoroplethVariableReducer
} from './selectedVariablesReducer';
import plotTypeReducer from './plotTypeReducer';
import choroplethMethodReducer from './choroplethMethodReducer';
import numberOfBreaksReducer from './numberOfBreaksReducer';
import {
  localMoranWeightsReducer,
  localMoranSignificanceReducer,
  selectedLocalMoranVariableReducer
} from './localMoranReducer';

const rootReducer = combineReducers({
  language: languageReducer,
  file: fileReducer,
  selectedGraphVariables: selectedGraphVariablesReducer,
  selectedChoroplethVariable: selectedChoroplethVariableReducer,
  plotType: plotTypeReducer,
  choroplethMethod: choroplethMethodReducer,
  numberOfBreaks: numberOfBreaksReducer,
  localMoranWeights: localMoranWeightsReducer,
  localMoranSignificance: localMoranSignificanceReducer,
  selectedLocalMoranVariable: selectedLocalMoranVariableReducer
});

export default rootReducer;
