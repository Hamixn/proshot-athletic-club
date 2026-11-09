import React from 'react';

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, variant = 'gold', className = '' }) => {
  const styles = {
    gold: 'text-[#C9A96A] border-[#C9A96A]/35 bg-[#C9A96A]/[0.06]',
    success: 'text-[#7BC49D] border-[#5E9E7E]/35 bg-[#5E9E7E]/[0.08]',
    warning: 'text-[#DFB374] border-[#C99752]/35 bg-[#C99752]/[0.08]',
    danger: 'text-[#DF8A8A] border-[#B85A5A]/35 bg-[#B85A5A]/[0.08]',
    info: 'text-[#B9BCC2] border-[#B9BCC2]/30 bg-[#B9BCC2]/[0.06]',
    neutral: 'text-[#8A857B] border-[#EDE8DF]/15 bg-[#17171A]',
  };

  const dots = {
    gold: 'bg-[#C9A96A]',
    success: 'bg-[#5E9E7E]',
    warning: 'bg-[#C99752]',
    danger: 'bg-[#B85A5A]',
    info: 'bg-[#B9BCC2]',
    neutral: 'bg-[#8A857B]',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-[2px] text-[11px] font-bold border shrink-0 whitespace-nowrap ${styles[variant]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[variant]}`} />
      <span>{children}</span>
    </span>
  );
};
