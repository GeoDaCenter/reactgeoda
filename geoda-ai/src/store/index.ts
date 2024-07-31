import {
  legacy_createStore as createStore,
  applyMiddleware,
  Middleware,
  UnknownAction,
  Dispatch
} from 'redux';
import {thunk} from 'redux-thunk';
import {createLogger} from 'redux-logger';
import {Layout} from 'react-grid-layout';
import keplerGlReducer, {enhanceReduxMiddleware} from '@kepler.gl/reducers';

import keplerLanguageMiddleware from './language-middleware';
import geodaReducer from '../reducers/index';
import {WeightsProps} from '@/actions/weights-actions';
import {RegressionProps} from '@/actions/regression-actions';
import {DatasetProps} from '@/actions';
import {MessageModel} from '@chatscope/chat-ui-kit-react';
import {GridItemProps, GridTextItemProps} from '@/utils/grid-utils';
import {RuleGroupType} from 'react-querybuilder';
import {handleGeoDaBrushLink} from '@/utils/kepler-utils';
import {MapProps} from '@/reducers/maps-reducer';
import {PlotStateProps} from '@/reducers/plot-reducer';

/**
 * Define the State of the Redux store
 */
export type GeoDaState = {
  keplerGl: typeof customizedKeplerGlReducer;
  root: {
    datasets: Array<DatasetProps>;
    maps: Array<MapProps>;
    language: string;
    uiState: {
      theme: 'light' | 'dark';
      defaultDatasetId: string;
      showPropertyPanel: boolean;
      showChatPanel: boolean;
      propertyPanelName: string;
      showOpenFileModal: boolean;
      showAddDatasetModal: boolean;
      showSaveProjectModal: boolean;
      showKeplerTable: boolean;
      showGridView: boolean;
      openAIKey: string;
      isOpenAIKeyChecked: boolean;
      screenCaptured: string;
      startScreenCapture: boolean;
      defaultPromptText: string;
      table: {
        queryBuilder?: RuleGroupType;
        queryCode?: string;
        showQueryBuilder: boolean;
      };
    };
    weights: Array<WeightsProps>;
    plots: Array<PlotStateProps>;
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
      // styleType: 'voyager'
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

// export const reducers = combineReducers({
//   keplerGl: customizedKeplerGlReducer,
//   root: geodaReducer
// });

export const reducers = (state: any, action: any) => {
  return {
    keplerGl: customizedKeplerGlReducer(state.keplerGl, action),
    root: geodaReducer(state.root, action, state.keplerGl)
  };
};

// Customize logger
const loggerMiddleware: Middleware<{}, any, Dispatch<any>> = createLogger({
  predicate: (_getState: any, action: UnknownAction) => {
    const skipLogging = [
      '@@kepler.gl/LAYER_HOVER',
      '@@kepler.gl/MOUSE_MOVE',
      '@@kepler.gl/UPDATE_MAP',
      'SET_MESSAGES'
    ];
    return !skipLogging.includes(action.type);
  }
});

export const middlewares = enhanceReduxMiddleware([keplerLanguageMiddleware]) as Middleware[];

const initialState = {};

// create store with initial state and reducers and middlewares
const store = createStore(
  reducers,
  initialState,
  applyMiddleware(...middlewares, thunk, loggerMiddleware)
);
// const store = configureStore({reducer: reducers, middleware: middlewares});

export default store;
