import dynamic from 'next/dynamic';

const DynamicEChartsReact = dynamic(() => import('echarts-for-react').then(mod => mod.default), {
  ssr: false
});

const EChartsPlot = ({data}: any) => {
  const formattedData = data.map((item: any) => [
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
      data: formattedData.map((item: any) => item[0])
    },
    yAxis: {},
    series: [
      {
        name: 'latitude',
        type: 'bar',
        data: formattedData.map((item: any) => item[1])
      },
      {
        name: 'longitude',
        type: 'bar',
        data: formattedData.map((item: any) => item[2])
      }
    ]
  };

  return <DynamicEChartsReact option={option} style={{height: '500px', width: '100%'}} />;
};

export default EChartsPlot;
