import {combineReducers} from 'redux';
import languageReducer from './language-reducer';
import fileReducer from './file-reducer';
import {
  selectedGraphVariablesReducer,
  selectedChoroplethVariableReducer
} from './select-variables-reducer';
import plotTypeReducer from './plot-reducer';
import choroplethMethodReducer from './choropleth-reducer';
import numberOfBreaksReducer from './colorbreaks-reducer';
import {
  localMoranWeightsReducer,
  localMoranSignificanceReducer,
  selectedLocalMoranVariableReducer,
  univariateAutocorrelationTypeReducer
} from './localmoran-reducer';
import {
  localMoranLayerReducer,
  localMoranDataReducer,
  choroplethDataReducer,
  choroplethLayerReducer
} from './kepler-layer-reducer';

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
  selectedLocalMoranVariable: selectedLocalMoranVariableReducer,
  univariateAutocorrelationType: univariateAutocorrelationTypeReducer,
  localMoranLayer: localMoranLayerReducer,
  localMoranData: localMoranDataReducer,
  choroplethData: choroplethDataReducer,
  choroplethLayer: choroplethLayerReducer
});

export default rootReducer;
