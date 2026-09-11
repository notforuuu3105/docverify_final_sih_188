import React from 'react';
import { InfernoLogo } from './InfernoLogo';

export { InfernoLogo };

interface GovEmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  monochrome?: boolean;
}

export const GovEmblem: React.FC<GovEmblemProps> = ({
  className = '',
  size = 'md',
  monochrome = false,
}) => {
  return (
    <InfernoLogo
      className={className}
      size={size}
      monochrome={monochrome}
    />
  );
};
