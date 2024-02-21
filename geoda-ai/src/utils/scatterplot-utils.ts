export type ScatterplotDataItemProps = {
  x: number;
  y: number;
};

export type ScatPlotDataProps = {
  variableX: string;
  variableY: string;
  points: ScatterplotDataItemProps[];
};


export function createScatterplotData(variableX: string, variableY: string, xData: number[], yData: number[]): ScatPlotDataProps {
  if (xData.length !== yData.length) {
    throw new Error("xData and yData arrays must have the same length.");
  }

  const points = xData.map((x, index) => ({ x, y: yData[index] }));

  return {
    variableX,
    variableY,
    points,
  };
}