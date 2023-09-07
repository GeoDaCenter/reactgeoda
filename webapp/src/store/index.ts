import {legacy_createStore as createStore, combineReducers, applyMiddleware} from 'redux';
import {createLogger} from 'redux-logger';
import {ProcessorResult} from '@kepler.gl/types';
import { RawData } from '../actions';
import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';
import rootReducer from '../reducers/index';
import keplerLanguageMiddleware from './language-middleware';
import { Layer } from '../actions';

export type GeoDaState = {
  keplerGl: typeof customizedKeplerGlReducer;
  root: {
    choroplethMethod: string;
    numberOfBreaks: number;
    selectedChoroplethVariable: string;
    selectedGraphVariables: string[];
    selectedLocalMoranVariable: string;
    localMoranWeights: string;
    localMoranSignificance: number;
    univariateAutocorrelationType: string;
    plotType: string;
    file: {
      rawFileData: RawData | null;
      fileData: ProcessorResult;
    };
    choroplethLayer: Layer;
    choroplethData: string[];
    localMoranLayer: Layer;
    localMoranData: string[];
    language: string;
  };
};

// Customize logger
const loggerMiddleware = createLogger({
  predicate: (_getState, action) => {
    const skipLogging = ['@@kepler.gl/LAYER_HOVER', '@@kepler.gl/MOUSE_MOVE'];
    return !skipLogging.includes(action.type);
  }
});

const customizedKeplerGlReducer = keplerGlReducer.initialState({
  uiState: {
    // hide side panel and data input window to disallow user customize the map
    readOnly: false,
    currentModal: null,
    mapControls: {
      mapLegend: {
        show: true,
        active: true
      }
    }
  }
});

const reducers = combineReducers({
  keplerGl: customizedKeplerGlReducer,
  root: rootReducer
});

const middlewares = enhanceReduxMiddleware([keplerLanguageMiddleware]);
const store = createStore(reducers, {}, applyMiddleware(...middlewares));

export default store;
