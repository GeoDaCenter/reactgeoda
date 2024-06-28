import React from 'react';

export const IconPause = ({width = 12, height = 12}) => {
  return (
    <svg
      className="fill-none stroke-current text-black opacity-60 hover:opacity-100 dark:text-white"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="path"
        d="M6 4h4v16H6zm8 0h4v16h-4z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
};
