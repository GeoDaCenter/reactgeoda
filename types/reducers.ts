import {} from '@kepler.gl/types';

export type ChoroplethMethodState = string;

export interface FileState {
  fileData: any[];
  rawFileData: any[];
}

export type LanguageState = string;

export type SelectedLocalMoranVariableState = string;
export type LocalMoranWeightsState = string; // 'rook', etc
export type LocalMoranSignificanceState = number;
export type UnivariateAutocorrelationTypeState = string;

export type NumberOfBreaksState = number;

export type PlotTypeState = string;

export type SelectedGraphVariablesState = any[];
export type SelectedChoroplethVariableState = string;

export interface RootState {
  root: {
    language: LanguageState;
    file: FileState;
    selectedGraphVariables: SelectedGraphVariablesState;
    selectedChoroplethVariable: SelectedChoroplethVariableState;
    plotType: PlotTypeState;
    choroplethMethod: ChoroplethMethodState;
    numberOfBreaks: NumberOfBreaksState;
    localMoranWeights: LocalMoranWeightsState;
    localMoranSignificance: LocalMoranSignificanceState;
    selectedLocalMoranVariable: SelectedLocalMoranVariableState;
    univariateAutocorrelationType: UnivariateAutocorrelationTypeState;
  };
  keplerGl: any;
}
