import {combineReducers} from 'redux';

import languageReducer from './language-reducer';
import fileReducer from './file-reducer';
import {
  selectedGraphVariablesReducer,
  selectedChoroplethVariableReducer
} from './select-variables-reducer';
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

import {uiReducer} from './ui-reducer';
import {weightsReducer} from './weights-reducer';
import {plotReducer} from './plot-reducer';

const rootReducer = combineReducers({
  language: languageReducer,
  file: fileReducer,
  selectedGraphVariables: selectedGraphVariablesReducer,
  selectedChoroplethVariable: selectedChoroplethVariableReducer,
  choroplethMethod: choroplethMethodReducer,
  numberOfBreaks: numberOfBreaksReducer,
  localMoranWeights: localMoranWeightsReducer,
  localMoranSignificance: localMoranSignificanceReducer,
  selectedLocalMoranVariable: selectedLocalMoranVariableReducer,
  univariateAutocorrelationType: univariateAutocorrelationTypeReducer,
  localMoranLayer: localMoranLayerReducer,
  localMoranData: localMoranDataReducer,
  choroplethData: choroplethDataReducer,
  choroplethLayer: choroplethLayerReducer,
  uiState: uiReducer,
  weights: weightsReducer,
  plots: plotReducer
});

export default rootReducer;
