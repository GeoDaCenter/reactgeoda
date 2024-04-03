import React, {FC, ReactNode} from 'react';
import {IconXClose} from '../icons/xclose';
import {useDispatch, useSelector} from 'react-redux';
import {GeoDaState} from '@/store';
import {updateLayout, hideGridItem} from '@/actions/dashboard-actions';

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

// A React component that renders a gear SVG icon
export const IconGear = ({width = 18, height = 18}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      className="fill-none stroke-current text-black dark:text-white"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.2981 23.1022H9.74656C9.04475 23.1022 8.47376 22.5314 8.47376 21.8298V19.3032C7.57044 18.9857 6.71984 18.4936 5.99047 17.8668L3.7984 19.132C3.60594 19.2427 3.38722 19.301 3.16545 19.3011C2.71062 19.3011 2.28762 19.0586 2.06155 18.6683L0.784811 16.4565C0.435264 15.8502 0.643998 15.0714 1.25005 14.7203L3.44103 13.4566C3.35183 12.9845 3.30664 12.5031 3.30664 12.0222C3.30664 11.5414 3.35178 11.06 3.44103 10.5879L1.25056 9.32457C0.642498 8.97226 0.433858 8.19221 0.784951 7.58532L2.06136 5.37652C2.288 4.98526 2.711 4.74244 3.1654 4.74244C3.38773 4.74244 3.60683 4.80137 3.79901 4.91284L5.99061 6.17593C6.72073 5.55001 7.57142 5.05857 8.47376 4.74137V2.2148C8.47376 1.51318 9.04475 0.942383 9.74656 0.942383H12.2982C13.0001 0.942383 13.571 1.51318 13.571 2.2148V4.74132C14.4777 5.05974 15.3285 5.55104 16.0546 6.1757L18.2465 4.91237C18.4385 4.80132 18.6576 4.74244 18.8798 4.74244C19.3342 4.74244 19.7568 4.98549 19.9825 5.37671L21.2599 7.58537C21.6103 8.19366 21.4015 8.97357 20.7945 9.32443L18.6036 10.5879C18.6922 11.0577 18.737 11.5391 18.737 12.0223C18.737 12.5092 18.6924 12.9907 18.604 13.4568L20.7942 14.72C21.0866 14.8874 21.2968 15.1606 21.3854 15.4886C21.4744 15.8182 21.4299 16.1619 21.26 16.4564L19.9835 18.6679C19.7572 19.0586 19.3344 19.3011 18.8799 19.3011C18.6582 19.3011 18.4394 19.2428 18.2471 19.1325L16.0545 17.8669C15.3255 18.494 14.4748 18.9855 13.5711 19.3015V21.8298C13.571 22.5314 13 23.1022 12.2981 23.1022ZM6.02933 17.1669C6.10601 17.1669 6.18209 17.1949 6.24148 17.2492C6.99819 17.9405 7.91169 18.4689 8.88326 18.7771C9.01391 18.8186 9.10264 18.9399 9.10264 19.0769V21.8298C9.10264 22.1846 9.39148 22.4733 9.74651 22.4733H12.2981C12.6532 22.4733 12.9421 22.1847 12.9421 21.8298V19.0748C12.9421 18.9376 13.0311 18.8161 13.162 18.7749C14.1337 18.4685 15.047 17.941 15.8031 17.2494C15.9043 17.1568 16.0538 17.1405 16.1726 17.209L18.5607 18.5875C18.6572 18.6428 18.7677 18.6723 18.8798 18.6723C19.1107 18.6722 19.325 18.55 19.439 18.3532L20.7153 16.1423C20.801 15.9937 20.8234 15.8198 20.7783 15.6528C20.7335 15.4872 20.6279 15.3496 20.4808 15.2654L18.0931 13.8883C17.9741 13.8196 17.9134 13.6816 17.9433 13.5475C18.0527 13.0561 18.1082 12.543 18.1082 12.0224C18.1082 11.5066 18.0527 10.9932 17.9432 10.4966C17.9136 10.3627 17.9743 10.225 18.0931 10.1565L20.48 8.77988C20.7869 8.60255 20.8925 8.20768 20.7152 7.8999L19.438 5.69143C19.324 5.49395 19.1103 5.37146 18.8799 5.37146C18.7682 5.37146 18.658 5.40109 18.5611 5.4571L16.1725 6.83382C16.0537 6.90226 15.9043 6.88585 15.8031 6.79332C15.0509 6.10487 14.1375 5.57734 13.1615 5.26763C13.031 5.22615 12.9422 5.10488 12.9422 4.96787V2.21485C12.9422 1.86005 12.6533 1.5713 12.2982 1.5713H9.74656C9.39153 1.5713 9.10269 1.86001 9.10269 2.21485V4.96777C9.10269 5.10479 9.01395 5.22605 8.88331 5.26754C7.91272 5.57546 6.99912 6.10323 6.24115 6.79374C6.14005 6.88595 5.99089 6.90207 5.87239 6.83377L3.4842 5.45738C3.38703 5.40099 3.27706 5.37141 3.1654 5.37141C2.93459 5.37141 2.72009 5.49409 2.60572 5.69157L1.3294 7.90023C1.1518 8.20726 1.25764 8.60195 1.56533 8.78016L3.95169 10.1564C4.07051 10.2249 4.13122 10.3626 4.10169 10.4965C3.99148 10.9963 3.93565 11.5096 3.93565 12.0223C3.93565 12.535 3.99153 13.0484 4.10169 13.5481C4.13122 13.682 4.07051 13.8197 3.95173 13.8882L1.56486 15.2649C1.25876 15.4421 1.15301 15.836 1.32964 16.1424L2.606 18.3535C2.71981 18.5499 2.93426 18.6722 3.1655 18.6722C3.27744 18.6722 3.38778 18.6428 3.48458 18.5872L5.8723 17.209C5.92119 17.1806 5.97542 17.1669 6.02933 17.1669Z"
        stroke="currentColor"
      />
      <path
        d="M11.023 15.8328C8.92034 15.8328 7.20969 14.1235 7.20969 12.0224C7.20969 9.92145 8.92034 8.21216 11.023 8.21216C13.125 8.21216 14.835 9.92145 14.835 12.0224C14.835 14.1235 13.125 15.8328 11.023 15.8328ZM11.023 8.84099C9.26712 8.84099 7.83861 10.2681 7.83861 12.0224C7.83861 13.7766 9.26712 15.2038 11.023 15.2038C12.7782 15.2038 14.2062 13.7766 14.2062 12.0224C14.2062 10.2681 12.7782 8.84099 11.023 8.84099Z"
        stroke="currentColor"
      />
    </svg>
  );
};

// A React component that renders an up SVG icon
export const IconUp = ({width = 18, height = 18}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="2 2 24 24"
      className="fill-current text-black dark:text-white"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M12 5L5 12H8V19H16V12H19L12 5Z" />
    </svg>
  );
};

interface GridCellProps {
  id: string;
  mode?: 'edit' | 'display';
  children: ReactNode;
}

export const GridCell: FC<GridCellProps> = ({id, mode, children}) => {
  const dispatch = useDispatch();

  // get grid layout from redux store
  const gridLayout = useSelector((state: GeoDaState) => state.root.dashboard.gridLayout);

  const onClickClose = () => {
    // dispatch action to add the grid item in gridItems with show set to false
    dispatch(hideGridItem({id}));
  };

  const onClickConfig = () => {};

  const onClickUp = () => {
    // put the selected grid item to the top by moving it to the first position in the gridLayout array
    if (gridLayout) {
      const item = gridLayout.find(item => item.i === id);
      if (item) {
        const newGridLayout = gridLayout.filter(item => item.i !== id);
        newGridLayout.push(item);
        // dispatch action to update grid layout
        dispatch(updateLayout({layout: newGridLayout}));
      }
    }
  };

  if (mode === 'display') {
    return <div className="h-full w-full">{children}</div>;
  }

  return (
    <div className="flex h-full w-full flex-col bg-white dark:bg-black">
      <div className="z-50 flex h-5 w-full flex-none cursor-pointer flex-row bg-gray-200 dark:bg-gray-600">
        <div className="react-grid-dragHandle flex-grow"></div>
        <div className="absolute right-0 top-0 z-50 m-1 flex flex-none cursor-pointer flex-row gap-1">
          <div onClick={onClickUp}>
            <IconUp width={14} height={14} />
          </div>
          <div onClick={onClickConfig}>
            <IconGear width={11} height={11} />
          </div>
          <div onClick={onClickClose}>
            <IconXClose width={12} height={12} />
          </div>
        </div>
      </div>
      <div className="w-full flex-grow overflow-auto p-2">{children}</div>
    </div>
  );
};
