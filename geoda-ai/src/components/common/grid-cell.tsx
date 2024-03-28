import React, {FC, ReactNode} from 'react';
import {IconXClose} from '../icons/xclose';

interface GridCellProps {
  key: string;
  onCloseGridItem: (key: string) => void;
  children: ReactNode;
}

// A React component that renders a move SVG icon
export const IconMove = ({width = 18, height = 18}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className="fill-current text-black dark:text-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 13H21V11H3V13ZM3 17H21V15H3V17ZM3 7V9H21V7H3Z"
      />
    </svg>
  );
};

export const GridCell: FC<GridCellProps> = ({key, onCloseGridItem, children}) => {
  const onClickClose = () => {
    onCloseGridItem(key);
  };

  return (
    <div className="h-full w-full">
      <div className="absolute right-0 top-0 z-50 m-1 flex cursor-pointer flex-row gap-1">
        <div className="react-grid-dragHandle">
          <IconMove width={12} height={12} />
        </div>
        <div onClick={onClickClose}>
          <IconXClose width={12} height={12} />
        </div>
      </div>
      {children}
    </div>
  );
};
