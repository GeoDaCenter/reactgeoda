import {combineReducers} from 'redux';

import languageReducer from './language-reducer';
import fileReducer from './file-reducer';
import {uiReducer} from './ui-reducer';
import {weightsReducer} from './weights-reducer';
import {plotReducer} from './plot-reducer';
import {regressionReducer} from './regression-reducer';
import {aiReducer} from './ai-reducer';
import {dashboardReducer} from './dashboard-reducer';
import {interactionReducer} from './interaction-reducer';

/**
 * Combine all reducers into a single root reducer
 */
const rootReducer = combineReducers({
  language: languageReducer,
  datasets: fileReducer,
  uiState: uiReducer,
  weights: weightsReducer,
  plots: plotReducer,
  regressions: regressionReducer,
  ai: aiReducer,
  dashboard: dashboardReducer,
  interaction: interactionReducer
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

// add function initialState to rootReducerWithLoadProject
rootReducerWithLoadProject.initialState = (initialState: any) => {
  // return a reducer function that use the initialState as the initial state
  return (state = initialState, action: any) => {
    return rootReducerWithLoadProject(state, action);
  };
};

export default rootReducerWithLoadProject;
