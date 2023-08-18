import {useDispatch, useSelector} from 'react-redux';
import {setLanguage} from '../actions';
import {GeoDaState} from '../store';

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: GeoDaState) => state.root.language);
  console.log(language);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setLanguage(e.target.value));
  };

  return (
    <select value={language} onChange={handleChange}>
      <option value="en">English</option>
      <option value="fi">Suomi</option>
      <option value="pt">Português</option>
      <option value="es">Español</option>
      <option value="ca">Català</option>
      <option value="ja">日本語</option>
      <option value="cn">简体中文</option>
      <option value="ru">Русский</option>
    </select>
  );
};

export default LanguageSelector;
