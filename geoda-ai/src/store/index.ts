import {
  legacy_createStore as createStore,
  applyMiddleware,
  Middleware,
  UnknownAction,
  Dispatch
} from 'redux';
import {thunk} from 'redux-thunk';
import {createLogger} from 'redux-logger';
import keplerGlReducer, {enhanceReduxMiddleware, KeplerGlState} from '@kepler.gl/reducers';
import keplerLanguageMiddleware from './language-middleware';
import geodaReducer, {GeoDaRootState} from '../reducers/index';
import {handleGeoDaBrushLink} from '@/utils/kepler-utils';

/**
 * Define the State of the Redux store
 */
export type GeoDaState = {
  keplerGl: typeof customizedKeplerGlReducer;
  root: GeoDaRootState;
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
          show: true,
          active: false
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
        },
        mapLocale: {
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
    BRUSH_LINK_FROM_GEODA: (state: KeplerGlState, action: UnknownAction) => {
      return handleGeoDaBrushLink(state, action);
    }
  });

// export const reducers = combineReducers({
//   keplerGl: customizedKeplerGlReducer,
//   root: geodaReducer
// });

export const reducers = (state: GeoDaState, action: UnknownAction) => {
  return {
    keplerGl: customizedKeplerGlReducer(state.keplerGl, action),
    root: geodaReducer(state.root, action, state.keplerGl)
  };
};

// Customize logger
const loggerMiddleware: Middleware<{}, any, Dispatch<any>> = createLogger({
  predicate: (_getState: any, action: UnknownAction) => {
    // skip logging in production mode
    if (process.env.NODE_ENV === 'production') {
      return false;
    }
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
  // @ts-ignore FIXME
  reducers,
  initialState,
  applyMiddleware(...middlewares, thunk, loggerMiddleware)
);
// const store = configureStore({reducer: reducers, middleware: middlewares});

export default store;
