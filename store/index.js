import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';
import {legacy_createStore as createStore, combineReducers, applyMiddleware} from 'redux';
import rootReducer from '../reducers/index';
import keplerLanguageMiddleware from './keplerLanguageMiddleware';
import {createLogger} from 'redux-logger';

// Customize logger
const loggerMiddleware = createLogger({
  predicate: (getState, action) => {
    const skipLogging = ['@@kepler.gl/LAYER_HOVER', '@@kepler.gl/MOUSE_MOVE'];
    return !skipLogging.includes(action.type);
  }
});

const customizedKeplerGlReducer = keplerGlReducer.initialState({
  uiState: {
    // hide side panel and data input window to disallow user customize the map
    readOnly: true,
    currentModal: null,
    mapLegend: {
      show: true,
      active: true
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
