import { LayerBaseConfig, LayerColorConfig, LayerVisConfig, LayerTextLabel } from '@kepler.gl/types';

export const SET_CHOROPLETH_LAYER = 'SET_CHOROPLETH_LAYER';
export const SET_CHOROPLETH_DATA = 'SET_CHOROPLETH_DATA';
export const SET_LOCAL_MORAN_LAYER = 'SET_LOCAL_MORAN_LAYER';
export const SET_LOCAL_MORAN_DATA = 'SET_LOCAL_MORAN_DATA';


type LayerConfig = LayerBaseConfig & Partial<LayerColorConfig> & {
  colorField: {
    name: string;
    type: string;
  };
  visConfig: LayerVisConfig & {
    colorRange: {
      category: string;
      type: string;
      name: string;
      colors: string[];
    };
  };
};

export type Layer = {
  id: string;
  type: string;
  config: LayerConfig;
};

export const setChoroplethLayer = (layer: Layer) => ({
  type: SET_CHOROPLETH_LAYER,
  payload: layer
});

export const setChoroplethData = (rows: string[]) => ({
  type: SET_CHOROPLETH_DATA,
  payload: rows
});

export const setLocalMoranLayer = (layer: Layer) => ({
  type: SET_LOCAL_MORAN_LAYER,
  payload: layer
});

export const setLocalMoranData = (rows: string[]) => ({
  type: SET_LOCAL_MORAN_DATA,
  payload: rows
});
