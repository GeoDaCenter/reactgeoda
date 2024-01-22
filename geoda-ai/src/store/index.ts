import {legacy_createStore as createStore, combineReducers, applyMiddleware} from 'redux';
import {createLogger} from 'redux-logger';

import {Layer} from '@kepler.gl/layers';
import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';

import keplerLanguageMiddleware from './language-middleware';
import rootReducer from '../reducers/index';

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
      rawFileData: any;
      fileData: any;
    };
    choroplethLayer: any;
    choroplethData: any;
    localMoranLayer: any;
    localMoranData: any;
    language: string;
    uiState: {
      showPropertyPanel: boolean;
      propertyPanelName: string;
      showOpenFileModal: boolean;
      showKeplerTableModal: boolean;
      showGridView: boolean;
      openAIKey: string;
    };
  };
};

const customizedKeplerGlReducer = keplerGlReducer
  .initialState({
    mapState: {
      latitude: 41.96988329124103,
      longitude: -87.85179027000271
    },
    mapStyle: {
      styleType: 'voyager'
    },
    uiState: {
      // hide side panel and data input window to disallow user customize the map
      readOnly: false,
      activeSidePanel: null,
      currentModal: null
      // mapControls: {
      //   mapLegend: {
      //     show: false,
      //     active: true
      //   }
      // }
    }
  })
  .plugin({
    SET_FILTER_INDEXES: (state: any, action: any) => {
      const {dataLabel, filteredIndex} = action.payload;
      const visState = state.visState;
      const datasets = visState.datasets;
      const dataId = Object.keys(datasets).find(dataId => datasets[dataId].label === dataLabel);
      if (!dataId) {
        return state;
      }
      const dataset = datasets[dataId];
      dataset.filteredIndex = filteredIndex.length === 0 ? dataset.allIndexes : filteredIndex;

      // calculate layer data
      const layers = visState.layers.filter((l: Layer) => l.config.dataId === dataId);
      layers.forEach((l: Layer) => {
        l.formatLayerData(datasets);
      });

      return {
        ...state
      };
    }
  });

const reducers = combineReducers({
  keplerGl: customizedKeplerGlReducer,
  root: rootReducer
});

// Customize logger
const loggerMiddleware = createLogger({
  predicate: (_getState: any, action: any) => {
    const skipLogging = [
      '@@kepler.gl/LAYER_HOVER',
      '@@kepler.gl/MOUSE_MOVE',
      '@@kepler.gl/SET_FEATURES'
    ];
    return !skipLogging.includes(action.type);
  }
});

const middlewares = enhanceReduxMiddleware([keplerLanguageMiddleware, loggerMiddleware]);

// create store with initial state and reducers and middlewares
// @ts-ignore FIXME
const store = createStore(reducers, {}, applyMiddleware(...middlewares));

export default store;
