export const GeoDaLogo = ({width = 32, height = 32, showAnimation = false}) => {
  return (
    <div className={`m-2 h-[${height}px] w-[${width}px] flex-none`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 22 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity={showAnimation ? '0' : '0.5'}>
          <path
            d="M2.5952 9.56375C2.5952 9.09558 2.97472 8.71606 3.44288 8.71606H12.1316C12.5998 8.71606 12.9793 9.09558 12.9793 9.56375V16.0273C12.9793 16.4955 12.5998 16.875 12.1316 16.875H3.44288C2.97472 16.875 2.5952 16.4955 2.5952 16.0273V9.56375Z"
            fill="#8878EA"
          />
          {showAnimation && (
            <animate
              attributeName="opacity"
              values="0;0.5;0.5"
              keyTimes="0;0.99;1"
              dur="5s"
              begin="0s"
              fill="freeze"
            />
          )}
        </g>
        <g opacity={showAnimation ? '0' : '0.5'}>
          <path
            d="M4.07864 7.44455C4.07864 6.97638 4.45816 6.59686 4.92633 6.59686H13.6151C14.0832 6.59686 14.4627 6.97638 14.4627 7.44454V13.9081C14.4627 14.3763 14.0832 14.7558 13.6151 14.7558H4.92633C4.45816 14.7558 4.07864 14.3763 4.07864 13.9081V7.44455Z"
            fill="#09BEDF"
          />
          {showAnimation && (
            <animate
              attributeName="opacity"
              values="0;0.5;0.5"
              keyTimes="0;0.99;1"
              dur="4s"
              begin="1s"
              fill="freeze"
            />
          )}
        </g>
        <g opacity={showAnimation ? '0' : '0.5'}>
          <path
            d="M6.09189 5.32534C6.09189 4.85718 6.47141 4.47766 6.93957 4.47766H15.6283C16.0965 4.47766 16.476 4.85718 16.476 5.32534V11.7889C16.476 12.2571 16.0965 12.6366 15.6283 12.6366H6.93957C6.47141 12.6366 6.09189 12.2571 6.09189 11.7889V5.32534Z"
            fill="#0EC94D"
          />
          {showAnimation && (
            <animate
              attributeName="opacity"
              values="0;0.5;0.5"
              keyTimes="0;0.99;1"
              dur="3s"
              begin="2s"
              fill="freeze"
            />
          )}
        </g>
        <g opacity={showAnimation ? '0' : '0.5'}>
          <path
            d="M7.78725 3.62997C7.78725 3.16181 8.16677 2.78229 8.63493 2.78229H17.3237C17.7918 2.78229 18.1714 3.16181 18.1714 3.62997V10.0935C18.1714 10.5617 17.7918 10.9412 17.3237 10.9412H8.63493C8.16677 10.9412 7.78725 10.5617 7.78725 10.0935V3.62997Z"
            fill="#AEDC03"
          />
          {showAnimation && (
            <animate
              attributeName="opacity"
              values="0;0.5;0.5"
              keyTimes="0;0.99;1"
              dur="2s"
              begin="3s"
              fill="freeze"
            />
          )}
        </g>
        <g opacity={showAnimation ? '0' : '0.5'}>
          <path
            d="M9.27069 1.72268C9.27069 1.25452 9.65021 0.875 10.1184 0.875H18.8071C19.2753 0.875 19.6548 1.25452 19.6548 1.72268V8.18626C19.6548 8.65442 19.2753 9.03394 18.8071 9.03394H10.1184C9.65021 9.03394 9.27069 8.65442 9.27069 8.18626V1.72268Z"
            fill="#E67316"
          />
          {showAnimation && (
            <animate
              attributeName="opacity"
              values="0;0.5;0.5"
              keyTimes="0;0.99;1"
              dur="1s"
              begin="4s"
              fill="freeze"
            />
          )}
        </g>
      </svg>
    </div>
  );
};
