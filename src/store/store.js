import { configureStore } from '@reduxjs/toolkit';
import { taskMiddleware } from 'react-palm/tasks';
import keplerGlReducer from 'kepler.gl/reducers';
import { enhanceReduxMiddleware } from 'kepler.gl/middleware';

export default configureStore({
  reducer: {
    keplerGl: keplerGlReducer,
  },
  middleware: (getDefaultMiddleware) =>
    enhanceReduxMiddleware([...getDefaultMiddleware(), taskMiddleware]),
});


// middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),