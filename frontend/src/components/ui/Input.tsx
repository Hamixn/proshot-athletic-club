import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leadingIcon,
  trailingIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || props.name;

  return (
    <div className="w-full text-right">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[11px] font-bold text-[#8A857B] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leadingIcon && (
          <div className="absolute right-0 text-[#C9A96A] pointer-events-none flex items-center">
            {leadingIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full py-3 bg-transparent border-0 border-b text-[#EDE8DF] placeholder-[#57534B] rounded-none text-sm transition-colors duration-200 outline-none focus:outline-none ${
            leadingIcon ? 'pr-7 pl-2' : 'px-0'
          } ${trailingIcon ? 'pl-7' : ''} ${
            error
              ? 'border-[#B85A5A] focus:border-[#B85A5A]'
              : 'border-[#EDE8DF]/20 hover:border-[#EDE8DF]/35 focus:border-[#C9A96A]'
          } ${className}`}
          {...props}
        />
        {trailingIcon && (
          <div className="absolute left-0 text-[#8A857B] pointer-events-none flex items-center">
            {trailingIcon}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-[#D88282] font-medium mt-1.5">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#8A857B] font-normal mt-1.5">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
