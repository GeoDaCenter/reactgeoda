import React from 'react';

export const Avatar = ({onClick}: {onClick: (event: React.MouseEvent) => void}) => {
  return (
    <div className="avatar" onClick={onClick}>
      <div className="group">
        <div className="overlap-group">
          <div className="text-wrapper">X</div>
        </div>
      </div>
    </div>
  );
};
