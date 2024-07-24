import React, {useState} from 'react';

/**
 * Create a svg icon with a warning sign.
 */
export function WarningIcon() {
  return (
    <svg
      className="warning-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFD700"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12" y2="16"></line>
    </svg>
  );
}

/**
 * Create a svg icon with a green check mark
 */
export function CheckIcon() {
  return (
    <svg
      className="check-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#008000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

/**
 * Create a svg icon with a red x mark
 */
export function ErrorIcon() {
  return (
    <svg
      className="x-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FF0000"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

/**
 * Create a svg icon with a waiting sign
 */
export function WaitingIcon() {
  return (
    <svg
      className="waiting-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFD700"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12" y2="16"></line>
    </svg>
  );
}

export enum WarningType {
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
  WAIT = 'wait'
}

export type WarningBoxProps = {
  message: string;
  type: WarningType;
  onClick?: () => void;
  dismissAfter?: number;
};

/**
 * Create a warning box React component that contains a warning icon and a warning message.
 * The warning message is passed in as props.
 * The warning icon and warning message are aligned horizontally.
 */
export function WarningBox(props: WarningBoxProps) {
  const onClick = props.onClick;

  // add a state to make the warning box disappear after 1 second
  const [visible, setVisible] = useState(true);

  if (props.dismissAfter) {
    setTimeout(() => {
      setVisible(false);
    }, props.dismissAfter);
  }

  return visible ? (
    <div
      className="warning-box flex cursor-pointer flex-row  bg-yellow-50 p-2 text-sm text-yellow-800 dark:bg-gray-800 dark:text-yellow-300"
      onClick={onClick}
    >
      <div className="warning-icon p-1">
        {props.type === 'error' && <ErrorIcon />}
        {props.type === 'warning' && <WarningIcon />}
        {props.type === 'success' && <CheckIcon />}
        {props.type === 'wait' && <WaitingIcon />}
      </div>
      <div className="warning-message flex-grow p-1">{props.message}</div>
    </div>
  ) : null;
}

export function SuccessBox(props: WarningBoxProps) {
  return (
    <div className="warning-box flex flex-row bg-green-50 p-2 text-sm text-green-800 dark:bg-gray-800 dark:text-green-300">
      <div className="warning-icon p-1">
        <CheckIcon />
      </div>
      <div className="warning-message flex-grow p-1">{props.message}</div>
    </div>
  );
}
