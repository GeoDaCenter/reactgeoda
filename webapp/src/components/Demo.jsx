import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {
  setDefaultData,
  setChoroplethMethod,
  setSelectedChoroplethVariable,
  setUnivariateAutocorrelationType,
  setSelectedLocalMoranVariable,
  setSelectedGraphVariables,
  setPlotType
} from '../actions';
import {processGeojson} from 'kepler.gl/processors';

const loadDefaultData = async () => {
  const url = 'https://webgeoda.github.io/data/natregimes.geojson';

  try {
    const response = await fetch(url);
    const rawData = await response.json();
    return {
      processedData: processGeojson(rawData),
      rawData
    };
  } catch (error) {
    console.error('Error occurred while loading the default data:', error);
    return {
      processedData: [],
      rawData: null
    };
  }
};

export const Demo = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    loadDefaultData().then(defaultData => {
      dispatch(setDefaultData(defaultData));
      dispatch(setChoroplethMethod('naturalBreaks'));
      dispatch(setUnivariateAutocorrelationType('localMoran'));
      dispatch(setSelectedChoroplethVariable('HR60'));
      dispatch(setSelectedLocalMoranVariable('HR60'));
      dispatch(setPlotType('scatter'));
      dispatch(setSelectedGraphVariables(['HC70', 'PO80']));
    });
  }, [dispatch]);

  return null;
};
