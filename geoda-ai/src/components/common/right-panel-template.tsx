import {Divider} from '@nextui-org/react';
import React from 'react';

/**
 * Create a svg icon with a gear icon.
 */
export function GearIcon() {
  return (
    <div className={'icon-gear'}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.5376 11.3294L24.2784 14.7294L22.1572 14.6C21.8391 16.1636 21.1319 17.6221 20.1008 18.8412L21.7565 20.8353L19.1168 23.0118L17.4905 21.0529C16.3458 21.7131 15.0791 22.1353 13.7667 22.2941L13.5958 24.5L10.196 24.2471L10.361 22.0941C8.9251 21.7737 7.58237 21.1276 6.43677 20.2059L4.84588 21.5588L2.62451 18.9647L4.19773 17.6353C3.37086 16.2768 2.89505 14.7346 2.81306 13.1471L0.520996 12.9706L0.774361 9.57647L3.20784 9.75882C3.60977 8.43 4.29524 7.20385 5.21708 6.16471L3.96204 4.65294L6.60175 2.47647L7.88036 4.02941C9.08646 3.35035 10.4291 2.94843 11.8105 2.85294L11.9872 0.5L15.387 0.752941L15.2044 3.14706C16.5617 3.52508 17.8203 4.19349 18.8929 5.10588L20.7607 3.52353L22.9762 6.11765L21.0907 7.72353C21.7024 8.78388 22.1025 9.95245 22.2691 11.1647L24.5376 11.3294ZM6.8349 12.1451C6.59351 15.3054 8.96313 18.0632 12.1286 18.3059C13.6517 18.4258 15.1599 17.9345 16.3189 16.9408C17.478 15.9471 18.1923 14.533 18.3037 13.0118C18.5416 9.85115 16.1689 7.09601 13.0031 6.85677C9.83735 6.61753 7.07629 8.9847 6.8349 12.1451Z"
          fill="#000000"
        />
      </svg>
    </div>
  );
}

/**
 * A React component that renders a setting panel.
 * This component accepts a SettingPanelHeader component as a child, and a `children` prop for it's content.
 */
export const RightPanelContainer = ({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="h-scree h-full">
      <div className="w-full">
        <div className="space-y-1 p-4">
          <h4 className="text-medium font-medium">{title}</h4>
          <p className="text-small text-default-400">{description}</p>
        </div>
        <Divider className="my-2" />
      </div>
      <div className="flex flex-col" style={{height: 'calc(100% - 97px)'}}>
        {children}
      </div>
    </div>
  );
};
