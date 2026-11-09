import React from 'react';

export const Alert: React.FC<{
  type?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}> = ({ type = 'info', children, className = '' }) => {
  const styles = {
    success: 'bg-[#101915] text-[#B8DEC8] border-[#5E9E7E]/40 border-r-2 border-r-[#5E9E7E]',
    error: 'bg-[#1C1112] text-[#E8B5B5] border-[#B85A5A]/40 border-r-2 border-r-[#B85A5A]',
    warning: 'bg-[#1A150E] text-[#E6CFA8] border-[#C99752]/40 border-r-2 border-r-[#C99752]',
    info: 'bg-[#141417] text-[#EDE8DF] border-[#EDE8DF]/15 border-r-2 border-r-[#C9A96A]',
  };

  return (
    <div
      className={`px-4 py-3 rounded-[2px] border text-xs font-medium leading-relaxed ${styles[type]} ${className}`}
    >
      {children}
    </div>
  );
};
