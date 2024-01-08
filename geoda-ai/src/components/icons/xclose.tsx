import React from 'react';

import { IconProps } from '../navigator/icons';

export const IconXClose = ({className}: IconProps) => {
  return (
    <div className={'icon-upload'}>
      <svg
        className={`x-close ${className}`}
        fill="none"
        height="24"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="path"
          d="M18 6L6 18M6 6L18 18"
          stroke="black"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
