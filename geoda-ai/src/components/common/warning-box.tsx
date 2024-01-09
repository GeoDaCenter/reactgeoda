import React from 'react';

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
 * Create a warning box React component that contains a warning icon and a warning message.
 * The warning message is passed in as props.
 * The warning icon and warning message are aligned horizontally.
 */
export function WarningBox(props: {message: string}) {
  return (
    <div className="warning-box mb-4 flex flex-row  bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-gray-800 dark:text-yellow-300">
      <div className="warning-icon p-1">
        <WarningIcon />
      </div>
      <div className="warning-message flex-grow p-1">{props.message}</div>
    </div>
  );
}
