import keplerGlReducer, { uiStateUpdaters } from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
import { taskMiddleware } from "react-palm/tasks";
import rootReducer from "../reducers/index";
import keplerLanguageMiddleware from "./keplerLanguageMiddleware";

const customizedKeplerGlReducer = keplerGlReducer.initialState({
  uiState: {
    // hide side panel and data input window to disallow user customize the map
    readOnly: true,
    currentModal: null,
    mapLegend: {
      show: true,
      active: true,
    },
  },
});

const reducers = combineReducers({
  keplerGl: customizedKeplerGlReducer,
  root: rootReducer,
});

const store = createStore(
  reducers,
  {},
  applyMiddleware(taskMiddleware, keplerLanguageMiddleware)
);
export default store;
