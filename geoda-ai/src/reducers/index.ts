import {combineReducers} from 'redux';

import languageReducer from './language-reducer';
import fileReducer from './file-reducer';
import {uiReducer} from './ui-reducer';
import {weightsReducer} from './weights-reducer';
import {plotReducer} from './plot-reducer';
import {regressionReducer} from './regression-reducer';
import {aiReducer} from './ai-reducer';

/**
 * Combine all reducers into a single root reducer
 */
const rootReducer = combineReducers({
  language: languageReducer,
  file: fileReducer,
  uiState: uiReducer,
  weights: weightsReducer,
  plots: plotReducer,
  regressions: regressionReducer,
  ai: aiReducer
});

export default rootReducer;
