import React from 'react';
import dynamic from 'next/dynamic';
import {useSelector} from 'react-redux';

import {GeoDaState} from '../store';

const DynamicResponsiveBarCanvas = dynamic(
  () => import('@nivo/bar').then(mod => mod.ResponsiveBarCanvas),
  {
    ssr: false
  }
);
const DynamicResponsiveScatterPlotCanvas = dynamic(
  () => import('@nivo/scatterplot').then(mod => mod.ResponsiveScatterPlotCanvas),
  {ssr: false}
);

const NivoPlot = () => {
  const data = useSelector((state: GeoDaState) => state.root.file.fileData);
  const selectedGraphVariables = useSelector(
    (state: GeoDaState) => state.root.selectedGraphVariables
  );
  const plotType = useSelector((state: GeoDaState) => state.root.plotType);

  if (!data || !data.rows || !data.fields || selectedGraphVariables.length < 2) return null;

  const variableIndices = selectedGraphVariables.map(variable =>
    data.fields.findIndex(field => field.name === variable)
  );

  let scatterFormattedData, barFormattedData;

  switch (plotType) {
    case 'scatter':
      scatterFormattedData = data.rows.map(item => ({
        id: item[variableIndices[0]],
        data: [{x: item[variableIndices[0]], y: parseFloat(item[variableIndices[1]])}]
      }));

      return (
        <DynamicResponsiveScatterPlotCanvas
          data={scatterFormattedData}
          xScale={{type: 'linear', min: 0, max: 'auto'}}
          yScale={{type: 'linear', min: 0, max: 'auto'}}
          margin={{top: 50, right: 130, bottom: 55, left: 70}}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: selectedGraphVariables[0],
            legendPosition: 'middle',
            legendOffset: 46
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: selectedGraphVariables[1],
            legendPosition: 'middle',
            legendOffset: -60
          }}
        />
      );
    case 'bar':
      barFormattedData = data.rows.map(item => ({
        [selectedGraphVariables[0]]: item[variableIndices[0]],
        [selectedGraphVariables[1]]: parseFloat(item[variableIndices[1]])
      }));

      if (barFormattedData.length > 0) {
        return (
          <DynamicResponsiveBarCanvas
            data={barFormattedData}
            keys={[selectedGraphVariables[1]]}
            indexBy={selectedGraphVariables[0]}
            margin={{top: 60, right: 140, bottom: 70, left: 90}}
            minValue="auto"
            maxValue="auto"
            groupMode="stacked"
            layout="horizontal"
            padding={0.3}
            valueScale={{type: 'linear'}}
            indexScale={{type: 'band', round: true}}
            borderWidth={0}
            borderRadius={0}
          />
        );
      }
      break;
    default:
      break;
  }

  return null;
};

export default NivoPlot;
