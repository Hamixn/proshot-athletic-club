import React from 'react';

export const RTLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      dir="rtl"
      className="proshot-member-center-app min-h-screen bg-[#060709] text-slate-100 antialiased select-none selection:bg-[#D4AF37] selection:text-black font-sans"
    >
      {children}
    </div>
  );
};
