import React, {PropsWithChildren} from 'react';
import {RenderOptions, render} from '@testing-library/react';
import {Provider} from 'react-redux';

// As a basic setup, import your same slice reducers
import {GeoDaState, reducers} from '../src/store';
import {legacy_createStore as createStore} from 'redux';
import IntlProviderWrapper from '@/components/intl-provider-wrapper';

// This type interface extends the default options for render from RTL, as well
// as allows the user to specify other things such as initialState, store.
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<GeoDaState>;
  store?: any;
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    // store = configureStore({ reducer: { user: userReducer }, preloadedState }),
    store = createStore(reducers, preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({children}: PropsWithChildren<{}>): React.JSX.Element {
    return (
      <Provider store={store}>
        <IntlProviderWrapper>{children}</IntlProviderWrapper>
      </Provider>
    );
  }

  // Return an object with the store and all of RTL's query functions
  return {store, ...render(ui, {wrapper: Wrapper, ...renderOptions})};
}
