import {SET_LANGUAGE} from '../actions/languageActions';
import {ActionTypes} from '@kepler.gl/actions';

const keplerLanguageMiddleware = (store: any) => (next: any) => (action: any) => {
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
