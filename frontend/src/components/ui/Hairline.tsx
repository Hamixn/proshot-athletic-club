import React from 'react';

export const Hairline: React.FC<{
  tone?: 'subtle' | 'brass' | 'silver';
  className?: string;
}> = ({ tone = 'subtle', className = '' }) => {
  const tones = {
    subtle: 'border-[#EDE8DF]/[0.08]',
    brass: 'border-[#C9A96A]/30',
    silver: 'border-[#B9BCC2]/25',
  };

  return <hr className={`border-0 border-t ${tones[tone]} my-0 ${className}`} />;
};
