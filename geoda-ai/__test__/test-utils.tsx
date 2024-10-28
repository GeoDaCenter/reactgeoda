import React, {PropsWithChildren} from 'react';
import {RenderOptions, render} from '@testing-library/react';
import {Provider} from 'react-redux';
// As a basic setup, import your same slice reducers
import {GeoDaState, middlewares, reducers} from '../src/store';
import {legacy_createStore as createStore, applyMiddleware} from 'redux';
import {thunk} from 'redux-thunk';
import ReduxThunkTester from 'redux-thunk-tester';

// import IntlProviderWrapper from '@/components/intl-provider-wrapper';
import {IntlProvider} from 'react-intl';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<GeoDaState>;
  store?: any;
}

export function configureTestStore(preloadedState = {}) {
  const reduxThunkTester = new ReduxThunkTester();

  const store = createStore(
    // @ts-ignore FIXME
    reducers,
    preloadedState,
    applyMiddleware(...middlewares, reduxThunkTester.createReduxThunkHistoryMiddleware(), thunk)
  );

  const origDispatch = store.dispatch;
  store.dispatch = jest.fn(origDispatch);

  return {reduxThunkTester, store};
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    // @ts-ignore FIXME
    // store = configureTestStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  const {
    store,
    reduxThunkTester: {getActionHistoryAsync, getActionHistoryStringifyAsync}
  } = configureTestStore(preloadedState);

  function Wrapper({children}: PropsWithChildren<{}>): React.JSX.Element {
    return (
      <Provider store={store}>
        <IntlProvider locale="en">{children}</IntlProvider>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return {
    store,
    getActionHistoryAsync,
    getActionHistoryStringifyAsync,
    ...render(ui, {wrapper: Wrapper, ...renderOptions})
  };
}
