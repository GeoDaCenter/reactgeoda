import {combineReducers} from 'redux';

import languageReducer from './language-reducer';
import fileReducer from './file-reducer';
import {uiReducer} from './ui-reducer';
import {weightsReducer} from './weights-reducer';
import {plotReducer} from './plot-reducer';
import {regressionReducer} from './regression-reducer';
import {aiReducer} from './ai-reducer';
import {dashboardReducer} from './dashboard-reducer';
import {keplerReducer} from './kepler-reducer';

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
  ai: aiReducer,
  dashboard: dashboardReducer,
  kepler: keplerReducer
});

const rootReducerWithLoadProject = (state: any, action: any) => {
  switch (action.type) {
    case 'LOAD_PROJECT':
      state = {
        ...state,
        ...action.payload
      };
      return state;
    default:
      return rootReducer(state, action);
  }
};

export default rootReducerWithLoadProject;
