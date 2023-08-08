import React from 'react';

export const GeoDaLogo = ({
  className,
  geodaLogoClassName,
  geodaLogo = '/assets/img/geoda-logo.png'
}) => {
  return (
    <div className={`geo-da-logo ${className}`}>
      <img className={`geoda-logo ${geodaLogoClassName}`} alt="Geoda logo" src={geodaLogo} />
    </div>
  );
};
