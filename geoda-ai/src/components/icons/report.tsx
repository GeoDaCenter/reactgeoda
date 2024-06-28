import React from 'react';

// svg icon for report issue
export const IconReport = ({width = 12, height = 12}) => {
  return (
    <svg
      className="fill-none stroke-current text-black dark:text-white"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M3 3h18v18H3V3zm12 4h-2V7h2v2zm0 2h-2v6h2V9zm-2 8h2v-2h-2v2z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
