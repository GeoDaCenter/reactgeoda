import {UnknownAction} from 'redux';

import {GeoDaState} from '@/store';
import languageReducer, {LanguageAction} from './language-reducer';
import fileReducer, {DatasetsAction} from './file-reducer';
import {UiAction, uiReducer} from './ui-reducer';
import {WeightsAction, weightsReducer} from './weights-reducer';
import {PlotAction, plotReducer} from './plot-reducer';
import {RegressionAction, regressionReducer} from './regression-reducer';
import {AiAction, aiReducer} from './ai-reducer';
import {DashboardAction, dashboardReducer} from './dashboard-reducer';
import {interactionReducer, InteractionAction} from './interaction-reducer';
import {MapsAction, mapsReducer} from './maps-reducer';

/**
 * Combine all reducers into a single root reducer
 */
const rootReducer = (
  state: GeoDaState['root'],
  action: UnknownAction,
  keplerState: GeoDaState['keplerGl']
) => {
  return {
    language: languageReducer(state?.language, action as LanguageAction),
    datasets: fileReducer(state?.datasets, action as DatasetsAction),
    maps: mapsReducer(state?.maps, action as MapsAction, keplerState),
    uiState: uiReducer(state?.uiState, action as UiAction),
    weights: weightsReducer(state?.weights, action as WeightsAction),
    plots: plotReducer(state?.plots, action as PlotAction),
    regressions: regressionReducer(state?.regressions, action as RegressionAction),
    ai: aiReducer(state?.ai, action as AiAction),
    dashboard: dashboardReducer(state?.dashboard, action as DashboardAction),
    interaction: interactionReducer(state?.interaction, action as InteractionAction)
  };
};

const rootReducerWithLoadProject = (
  state: GeoDaState['root'],
  action: any,
  keplerState: GeoDaState['keplerGl']
) => {
  switch (action.type) {
    case 'LOAD_PROJECT':
      state = {
        ...state,
        ...action.payload
      };
      return state;
    default:
      return rootReducer(state, action, keplerState);
  }
};

// add function initialState to rootReducerWithLoadProject
// rootReducerWithLoadProject.initialState = (initialState: any) => {
//   // return a reducer function that use the initialState as the initial state
//   return (state = initialState, action: any) => {
//     return rootReducerWithLoadProject(state, action);
//   };
// };

export default rootReducerWithLoadProject;
