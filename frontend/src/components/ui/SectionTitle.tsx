import React from 'react';

interface SectionTitleProps {
  index?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  index,
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`pb-4 border-b border-[#EDE8DF]/10 flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0 flex-1">
        {(index || eyebrow) && (
          <div className="flex items-center gap-2.5 mb-1.5">
            {index && (
              <span className="font-editorial italic text-sm text-[#C9A96A] leading-none">
                {index}
              </span>
            )}
            {index && eyebrow && (
              <span className="w-4 h-px bg-[#C9A96A]/40 inline-block" />
            )}
            {eyebrow && (
              <span className="eyebrow-latin text-[#8A857B]">
                {eyebrow}
              </span>
            )}
          </div>
        )}
        <h2 className="text-xl sm:text-2xl font-black text-[#EDE8DF] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#8A857B] font-normal mt-1 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
