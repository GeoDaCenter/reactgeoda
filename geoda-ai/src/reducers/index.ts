import {UnknownAction} from 'redux';

import languageReducer, {LanguageAction} from './language-reducer';
import fileReducer, {DatasetProps, DatasetsAction} from './file-reducer';
import {UiAction, uiReducer, UiStateProps} from './ui-reducer';
import {WeightsAction, WeightsProps, weightsReducer} from './weights-reducer';
import {PlotAction, plotReducer, PlotStateProps} from './plot-reducer';
import {RegressionAction, RegressionProps, regressionReducer} from './regression-reducer';
import {AiAction, aiReducer, AiStateProps} from './ai-reducer';
import {DashboardAction, dashboardReducer, DashboardStateProps} from './dashboard-reducer';
import {interactionReducer, InteractionAction, KeplerBrushLinkProps} from './interaction-reducer';
import {MapProps, MapsAction, mapsReducer} from './maps-reducer';
import {SpatialJoinAction, spatialJoinReducer, SpatialJoinState} from './spatial-join-reducer';
import {KeplerGlState} from '@kepler.gl/reducers';

export type GeoDaRootState = {
  datasets: Array<DatasetProps>;
  maps: Array<MapProps>;
  language: string;
  uiState: UiStateProps;
  weights: Array<WeightsProps>;
  plots: Array<PlotStateProps>;
  regressions: Array<RegressionProps>;
  ai: AiStateProps;
  dashboard: DashboardStateProps;
  interaction: KeplerBrushLinkProps;
  spatialJoin: SpatialJoinState;
};

/**
 * Combine all reducers into a single root reducer
 */
const rootReducer = (state: GeoDaRootState, action: UnknownAction, keplerState: KeplerGlState) => {
  return {
    language: languageReducer(state?.language, action as LanguageAction),
    datasets: fileReducer(state?.datasets, action as DatasetsAction),
    maps: mapsReducer(state?.maps, action as MapsAction),
    uiState: uiReducer(state?.uiState, action as UiAction),
    weights: weightsReducer(state?.weights, action as WeightsAction),
    plots: plotReducer(state?.plots, action as PlotAction, keplerState),
    regressions: regressionReducer(state?.regressions, action as RegressionAction),
    ai: aiReducer(state?.ai, action as AiAction),
    dashboard: dashboardReducer(state?.dashboard, action as DashboardAction),
    interaction: interactionReducer(state?.interaction, action as InteractionAction),
    spatialJoin: spatialJoinReducer(state?.spatialJoin, action as SpatialJoinAction)
  };
};

const rootReducerWithLoadProject = (
  state: GeoDaRootState,
  action: any,
  keplerState: KeplerGlState
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
