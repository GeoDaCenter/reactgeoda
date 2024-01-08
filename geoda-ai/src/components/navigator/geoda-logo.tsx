/* eslint-disable @next/next/no-img-element */
export type GeoDaLogoProps = {
  className: string;
  geodaLogoClassName: string;
};

export const GeoDaLogo = ({className, geodaLogoClassName}: GeoDaLogoProps) => {
  return (
    <div className={`geo-da-logo ${className}`}>
      <img
        className={`geoda-logo ${geodaLogoClassName}`}
        alt="Geoda logo"
        src="data:image/png;base64,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"
      />
    </div>
  );
};