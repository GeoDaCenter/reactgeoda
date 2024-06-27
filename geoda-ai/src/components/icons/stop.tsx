import React from 'react';

// svg icon for stop with a circle around a square
export const IconStop = ({width = 12, height = 12}) => {
  return (
    <svg
      className="fill-none stroke-current text-black dark:text-white"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="stop">
        <rect
          x="4.5"
          y="4.5"
          width="15"
          height="15"
          fill="black"
          stroke="#F9FFF9"
          strokeWidth="0.3"
        />
        <circle cx="12" cy="12" r="7.5" fill="black" stroke="#F9FFF9" strokeWidth="0.3" />
      </g>
    </svg>
  );
};
