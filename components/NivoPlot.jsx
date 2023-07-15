import React from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';

const DynamicResponsiveBar = dynamic(() => import('@nivo/bar').then((mod) => mod.ResponsiveBar), { ssr: false });
const DynamicResponsiveScatterPlot = dynamic(() => import('@nivo/scatterplot').then((mod) => mod.ResponsiveScatterPlot), { ssr: false });

const NivoPlot = () => {
  const data = useSelector(state => state.root.file.fileData);
  const selectedVariables = useSelector(state => state.root.selectedVariable);
  const plotType = useSelector(state => state.root.plotType);

  // Format data based on the selected plot type
  let formattedData;
  switch (plotType) {
    case 'scatter':
      formattedData = data.map(item => ({
        id: item[selectedVariables[0]],
        data: [{x: parseFloat(item[selectedVariables[0]]), y: parseFloat(item[selectedVariables[1]])}]
      }));
      return (
        <DynamicResponsiveScatterPlot
          data={formattedData}
          xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
          axisBottom={{ legend: selectedVariables[1] }}
          axisLeft={{ legend: selectedVariables[2] }}
          animate
        />
      );
    case 'bar':
    default:
      formattedData = data.map(item => ({
        [selectedVariables[0]]: item[selectedVariables[0]],
        [selectedVariables[1]]: parseFloat(item[selectedVariables[1]])
      }));
      return (
        <DynamicResponsiveBar
          data={formattedData}
          keys={[selectedVariables[1]]}
          indexBy={selectedVariables[0]}
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          groupMode="stacked"
        />
      );
  }
};

export default NivoPlot;
