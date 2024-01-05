import {SET_LANGUAGE} from '../actions';

export type LanguageAction = {
  type: typeof SET_LANGUAGE;
  payload: string;
};

const initialState = 'en';

const languageReducer = (state = initialState, action: LanguageAction) => {
  switch (action.type) {
    case SET_LANGUAGE:
      return action.payload;
    default:
      return state;
  }
};

export default languageReducer;
