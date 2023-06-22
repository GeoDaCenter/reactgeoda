"use client"
import React from "react";
import keplerGlReducer from "kepler.gl/reducers";
import { createStore, combineReducers, applyMiddleware } from "redux";
//import { taskMiddleware } from "react-palm/tasks";
import thunk from 'redux-thunk';
import { Provider, useDispatch } from "react-redux";
import KeplerGl from "kepler.gl";
import { addDataToMap } from "kepler.gl/actions";
import useSwr from "swr";

const reducers = combineReducers({
  keplerGl: keplerGlReducer
});

const store = createStore(reducers, {}, applyMiddleware(thunk));

export default function App() {
  return (
    <Provider store={store}>
      <Map />
    </Provider>
  );
}

function Map() {
  const dispatch = useDispatch();
  const { data } = useSwr("covid", async () => {
    const response = await fetch(
      "https://gist.githubusercontent.com/leighhalliday/a994915d8050e90d413515e97babd3b3/raw/a3eaaadcc784168e3845a98931780bd60afb362f/covid19.json"
    );
    const data = await response.json();
    return data;
  });

  React.useEffect(() => {
    if (data) {
      dispatch(
        addDataToMap({
          datasets: {
            info: {
              label: "COVID-19",
              id: "covid19"
            },
            data
          },
          option: {
            centerMap: true,
            readOnly: false
          },
          config: {}
        })
      );
    }
  }, [dispatch, data]);

  return (
    <KeplerGl
      id="covid"
      mapboxApiAccessToken={process.env.pk.eyJ1IjoianVzdGlua2xlaWQiLCJhIjoiY2xqNTIybnp3MDZzaDNxcnF3MGhpZGt1aiJ9.NlpIZZvaK7DrIZ87qi1pZA}
      width={window.innerWidth}
      height={window.innerHeight}
    />
  );
}











// import { Provider } from 'react-redux';
// import store from '../store/store';
// import KeplerMapComponent from '../components/KeplerMapComponent';
// import yourData from './yourData.json';

// function App() {
//   return (
//     <Provider store={store}>
//       <KeplerMapComponent data={yourData} />
//     </Provider>
//   );
// }

// export default App;