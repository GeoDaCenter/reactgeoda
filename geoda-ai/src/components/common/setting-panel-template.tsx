import React from 'react';

/**
 * Create a svg icon with a gear icon.
 */
export function GearIcon() {
  return (
    <svg
      className="gear-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FFD700"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a8 8 0 01-2.05 2.05l-2.3-1.15a6 6 0 00-1.4-.7l-.7-2.1a6 6 0 000-2.8l.7-2.1a6 6 0 001.4-.7l2.3-1.15A8 8 0 0119.4 9M9 2v.01M3 9h.01"></path>
    </svg>
  );
}

/**
 * A React component that renders a setting panel.
 * This component accepts a SettingPanelHeader component as a child, and a `children` prop for it's content.
 */
export const SettingPanelContainer = ({
  title,
  description,
  icon,
  children
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <div className="settings-panel">
      <div className="modal-header">
        <div className="content">
          {icon ?? <GearIcon />}
          <div className="text-and-supporting">
            <div className="text">{title}</div>
            <div className="supporting-text">{description}</div>
          </div>
        </div>
        <div className="padding-bottom" />
      </div>
      <div className="form-wrapper text-sm!important">{children}</div>
    </div>
  );
};
