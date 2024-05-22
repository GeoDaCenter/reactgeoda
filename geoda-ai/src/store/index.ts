import {legacy_createStore as createStore, combineReducers, applyMiddleware} from 'redux';
import {createLogger} from 'redux-logger';
import {Layout} from 'react-grid-layout';
import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';

import keplerLanguageMiddleware from './language-middleware';
import rootReducer from '../reducers/index';
import {WeightsProps} from '@/actions/weights-actions';
import {PlotProps} from '@/actions/plot-actions';
import {RegressionProps} from '@/actions/regression-actions';
import {RawFileDataProps} from '@/actions';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {GridItemProps, GridTextItemProps} from '@/utils/grid-utils';
import {RuleGroupType} from 'react-querybuilder';
import {handleGeoDaBrushLink} from '@/utils/kepler-utils';

/**
 * Define the State of the Redux store
 */
export type GeoDaState = {
  keplerGl: typeof customizedKeplerGlReducer;
  root: {
    file: {
      rawFileData: RawFileDataProps;
      fileData: any;
      id: string;
    };
    language: string;
    uiState: {
      theme: 'light' | 'dark';
      showPropertyPanel: boolean;
      propertyPanelName: string;
      showOpenFileModal: boolean;
      showSaveProjectModal: boolean;
      showKeplerTableModal: boolean;
      showGridView: boolean;
      openAIKey: string;
      screenCaptured: string;
      table: {
        queryBuilder?: RuleGroupType;
        queryCode?: string;
        showQueryBuilder: boolean;
      };
    };
    weights: Array<WeightsProps>;
    plots: Array<PlotProps>;
    regressions: Array<RegressionProps>;
    ai: {
      messages: Array<MessageModel>;
    };
    dashboard: {
      mode: 'edit' | 'display';
      gridLayout?: Layout[];
      gridItems?: GridItemProps[];
      textItems?: GridTextItemProps[];
    };
    interaction: {
      sourceId?: string;
      // brushLink: key is the dataId used in kepler.gl, value is the filtered index
      brushLink: {[key: string]: number[]};
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
      currentModal: null,
      mapControls: {
        mapDraw: {
          active: false,
          show: true
        },
        mapLegend: {
          show: true,
          active: false
        },
        toggle3d: {
          show: true,
          active: false
        },
        splitMap: {
          show: true,
          active: false
        }
      }
    }
    // visState: {
    //   editor: {
    //     mode: 'DRAW_RECTANGLE',
    //     features: [],
    //     selectedFeature: null,
    //     visible: true
    //   }
    // }
  })
  .plugin({
    BRUSH_LINK_FROM_GEODA: (state: any, action: any) => {
      return handleGeoDaBrushLink(state, action);
    }
  });

export const reducers = combineReducers({
  keplerGl: customizedKeplerGlReducer,
  root: rootReducer
});

// Customize logger
const loggerMiddleware = createLogger({
  predicate: (_getState: any, action: any) => {
    const skipLogging = [
      '@@kepler.gl/LAYER_HOVER',
      '@@kepler.gl/MOUSE_MOVE',
      '@@kepler.gl/UPDATE_MAP',
      'SET_MESSAGES'
    ];
    return !skipLogging.includes(action.type);
  }
});

export const middlewares = enhanceReduxMiddleware([keplerLanguageMiddleware, loggerMiddleware]);

// create store with initial state and reducers and middlewares
// @ts-ignore FIXME
const store = createStore(reducers, {}, applyMiddleware(...middlewares));
// const store = configureStore({reducer: reducers, middleware: middlewares});

export default store;
