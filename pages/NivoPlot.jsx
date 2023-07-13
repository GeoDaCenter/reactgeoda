import React from 'react';
import dynamic from 'next/dynamic';

const DynamicResponsiveBar = dynamic(() => import('@nivo/bar').then((mod) => mod.ResponsiveBar), { ssr: false });




const NivoPlot = ({ data }) => {
    const formattedData = data.map(item => ({
        iata: item.iata,
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude)
    }));

    return (
        <DynamicResponsiveBar
            data={formattedData}
            keys={['latitude', 'longitude']}
            indexBy="iata"
            margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            groupMode="stacked"
        />
    );
};

export default NivoPlot;
