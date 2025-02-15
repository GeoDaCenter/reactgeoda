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

// svg 24x24 icon with a dataset icon and a + sign on the top right corner
export const IconAddDataset = ({width = 20, height = 24}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className="fill-none stroke-[#FFF]"
    >
      <path
        fill="#ddd"
        fillRule="evenodd"
        d="M100 22.5v-.29a2.5 2.5 0 0 0-.014-.265c.005.185.014.369.014.555M74 10h7v9h9v7h-9v9h-7v-9h-9v-7h9zm3.5-5C67.805 5 60 12.805 60 22.5S67.805 40 77.5 40S95 32.195 95 22.5S87.195 5 77.5 5"
        color="currentColor"
      ></path>
      <path
        fill="#ddd"
        fillRule="evenodd"
        d="m5 11.418l27.275 12.67l.371 64.95L5 76.192ZM2.586 5.002A2.5 2.5 0 0 0 0 7.5v70.29a2.5 2.5 0 0 0 1.447 2.267l31.666 14.71A2.5 2.5 0 0 0 34.19 95a2.5 2.5 0 0 0 1.032-.232l30.613-14.221l30.613 14.22A2.5 2.5 0 0 0 100 92.5v-70a22.382 22.382 0 0 1-5 14.111v51.971L67.322 75.725l-.19-33.27a22.575 22.575 0 0 1-3.01-1.883l.2 35.162l-28.676 13.323l-.369-64.606l21.15-9.826a22.568 22.568 0 0 1 4.991-7.832l-27.252 12.66L3.553 5.233a2.5 2.5 0 0 0-.967-.231"
        color="#ddd"
      ></path>
    </svg>
  );
};
