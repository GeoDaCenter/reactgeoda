import {legacy_createStore as createStore, combineReducers, applyMiddleware} from 'redux';
import { createLogger } from 'redux-logger';
import {ProcessorResult} from '@kepler.gl/types';
import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';
import rootReducer from '../reducers/index';
import keplerLanguageMiddleware from './language-middleware';

export type WebGeoDaStore = {
  keplerGl: typeof customizedKeplerGlReducer;
  root: {
    choroplethMethod: string;
    numberOfBreaks: number;
    selectedChoroplethVariable: string[];
    file: {
      rawFileData: any;
      fileData: ProcessorResult;
    };
    choroplethLayer: any;
    choroplethData: any;
    localMoranLayer: any;
    localMoranData: any;
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

const middlewares = enhanceReduxMiddleware([keplerLanguageMiddleware, loggerMiddleware]);
const store = createStore(reducers, {}, applyMiddleware(...middlewares));

export default store;
