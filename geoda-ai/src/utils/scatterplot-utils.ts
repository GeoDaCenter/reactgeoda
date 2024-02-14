import {bin as d3bin} from 'd3-array';


export type ScatterplotDataItemProps = {
    x: number;
    y: number;
  };


export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
  points: ScatterplotDataItemProps[];
};


export function createScatterplotData(xData: number[], yData: number[]): ScatterplotDataItemProps[] {
    if (xData.length !== yData.length) {
      throw new Error("xData and yData arrays must  the same length.");
    }
  
    const scatterplotData = xData.map((x, index) => ({
      x: x,
      y: yData[index],
    }));
  
    return scatterplotData;
  }