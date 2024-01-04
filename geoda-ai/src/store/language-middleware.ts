import {Dispatch} from 'react';
import {AnyAction} from 'redux';

const keplerLanguageMiddleware = (store: any) => (next: Dispatch<AnyAction>) => (action: any) => {
  const result = next(action);

  if (action.type === 'SET_LANGUAGE') {
    const language = store.getState().root.language;
    store.dispatch({
      type: 'SET_LOCALE',
      payload: {locale: language}
    });
  }

  return result;
};

export default keplerLanguageMiddleware;
