import React from 'react';
import dynamic from 'next/dynamic';
import {useSelector} from 'react-redux';

const DynamicResponsiveBar = dynamic(() => import('@nivo/bar').then(mod => mod.ResponsiveBar), {
  ssr: false
});
const DynamicResponsiveScatterPlot = dynamic(
  () => import('@nivo/scatterplot').then(mod => mod.ResponsiveScatterPlot),
  {ssr: false}
);

const NivoPlot = () => {
  const data = useSelector(state => state.root.file.fileData);
  const selectedVariables = useSelector(state => state.root.selectedVariable);
  const plotType = useSelector(state => state.root.plotType);

  if (!data || !data.rows || !data.fields || selectedVariables.length < 2) return null;

  const variableIndices = selectedVariables.map(variable =>
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
        <DynamicResponsiveScatterPlot
          data={scatterFormattedData}
          xScale={{type: 'linear', min: 'auto', max: 'auto'}}
          yScale={{type: 'linear', min: 'auto', max: 'auto'}}
          axisBottom={{legend: selectedVariables[0]}}
          axisLeft={{legend: selectedVariables[1]}}
          animate
        />
      );
    case 'bar':
      barFormattedData = data.rows.map(item => ({
        [selectedVariables[0]]: item[variableIndices[0]],
        [selectedVariables[1]]: parseFloat(item[variableIndices[1]])
      }));

      if (barFormattedData.length > 0) {
        return (
          <DynamicResponsiveBar
            data={barFormattedData}
            keys={[selectedVariables[1]]}
            indexBy={selectedVariables[0]}
            margin={{top: 50, right: 130, bottom: 50, left: 60}}
            padding={0.3}
            groupMode="stacked"
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
