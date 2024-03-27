import React from 'react';

export const IconXClose = ({width = 18, height = 18}) => {
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
        d="M18 6L6 18M6 6L18 18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
