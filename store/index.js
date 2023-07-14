import keplerGlReducer from "kepler.gl/reducers";
import {createStore, combineReducers, applyMiddleware} from "redux";
import {taskMiddleware} from "react-palm/tasks";
import rootReducer from '../reducers/index'; 

const reducers = combineReducers({
  keplerGl: keplerGlReducer,
  root: rootReducer,
});

const store = createStore(reducers, {}, applyMiddleware(taskMiddleware));
export default store;