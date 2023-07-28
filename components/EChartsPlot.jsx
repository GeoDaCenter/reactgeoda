import React from 'react';
import dynamic from 'next/dynamic';

const DynamicEChartsReact = dynamic(() => import('echarts-for-react').then(mod => mod.default), {
  ssr: false
});

const EChartsPlot = ({data}) => {
  const formattedData = data.map(item => [
    item.iata,
    parseFloat(item.latitude),
    parseFloat(item.longitude)
  ]);

  const option = {
    tooltip: {},
    legend: {
      data: ['latitude', 'longitude']
    },
    xAxis: {
      data: formattedData.map(item => item[0])
    },
    yAxis: {},
    series: [
      {
        name: 'latitude',
        type: 'bar',
        data: formattedData.map(item => item[1])
      },
      {
        name: 'longitude',
        type: 'bar',
        data: formattedData.map(item => item[2])
      }
    ]
  };

  return <DynamicEChartsReact option={option} style={{height: '500px', width: '100%'}} />;
};

export default EChartsPlot;
