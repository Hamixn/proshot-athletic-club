import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tonal' | 'outline' | 'text' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold rounded-[2px] transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none';

  const variants = {
    // Solid Matte Brushed Brass (Zero Gradient, Zero Neon Glow)
    primary:
      'bg-[#C9A96A] hover:bg-[#DFC690] active:bg-[#B39254] text-[#0A0A0B] font-extrabold border border-[#C9A96A]',
    gold:
      'bg-[#C9A96A] hover:bg-[#DFC690] active:bg-[#B39254] text-[#0A0A0B] font-extrabold border border-[#C9A96A]',
    // Matte Charcoal with Hairline
    secondary:
      'bg-[#17171A] hover:bg-[#1E1E22] text-[#EDE8DF] border border-[#EDE8DF]/15 hover:border-[#EDE8DF]/30',
    // Brass Hairline Tonal
    tonal:
      'bg-[#C9A96A]/[0.08] hover:bg-[#C9A96A]/[0.14] text-[#C9A96A] border border-[#C9A96A]/35',
    // Architectural Hairline Outline
    outline:
      'bg-transparent hover:bg-[#EDE8DF]/[0.04] text-[#EDE8DF] border border-[#EDE8DF]/20 hover:border-[#C9A96A]/60',
    // Editorial Text Link
    text:
      'bg-transparent text-[#C9A96A] hover:text-[#DFC690] p-0 underline-offset-4 hover:underline',
    // Muted Oxblood Crimson
    danger:
      'bg-[#3A1618] hover:bg-[#4D1D20] text-[#F2D5D5] border border-[#B85A5A]/40',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs h-8 gap-1.5',
    md: 'px-5 py-2.5 text-xs sm:text-sm h-11 gap-2',
    lg: 'px-7 py-3.5 text-sm h-12 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-[1.5px] border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0 flex items-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};
