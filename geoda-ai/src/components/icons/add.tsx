import React from 'react';

// svg icon with a + sign for adding dataset
export const IconAdd = ({width = 24, height = 24}) => {
  return (
    <svg
      className="fill-none stroke-[#FFF]"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="add" fill="#444444">
        <line x1="12" x2="12" y1="5" y2="19" strokeWidth="3" strokeLinecap="round" />
        <line x1="5" x2="19" y1="12" y2="12" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
};
