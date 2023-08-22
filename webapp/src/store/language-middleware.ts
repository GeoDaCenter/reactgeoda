import {Dispatch} from 'react';
import {AnyAction} from 'redux';
import {ActionTypes} from '@kepler.gl/actions';
import {SET_LANGUAGE} from '../actions/language-actions';

const keplerLanguageMiddleware = (store: any) => (next: Dispatch<AnyAction>) => (action: any) => {
  const result = next(action);

  if (action.type === SET_LANGUAGE) {
    const language = store.getState().root.language;
    store.dispatch({
      type: ActionTypes.SET_LOCALE,
      payload: {locale: language}
    });
  }

  return result;
};

export default keplerLanguageMiddleware;
