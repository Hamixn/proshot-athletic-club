import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'luxury' | 'gold' | 'minimal';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'luxury',
}) => {
  const variants = {
    luxury: 'bg-[#111113] border border-[#EDE8DF]/10 rounded-[3px]',
    gold: 'bg-[#111113] border border-[#C9A96A]/35 rounded-[3px]',
    minimal: 'bg-[#0E0E10] border border-[#EDE8DF]/[0.07] rounded-[2px]',
  };

  return (
    <div className={`overflow-hidden ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  index?: string;
  eyebrow?: string;
}> = ({ title, subtitle, action, index, eyebrow }) => (
  <div className="px-6 py-5 border-b border-[#EDE8DF]/[0.08] flex items-end justify-between gap-4 bg-[#111113]">
    <div className="min-w-0 flex-1">
      {(index || eyebrow) && (
        <div className="flex items-center gap-2 mb-1.5">
          {index && (
            <span className="font-editorial italic text-sm text-[#C9A96A] leading-none">
              {index}
            </span>
          )}
          {eyebrow && (
            <span className="eyebrow-latin text-[#8A857B]">{eyebrow}</span>
          )}
        </div>
      )}
      <h3 className="font-black text-[#EDE8DF] text-lg leading-snug">{title}</h3>
      {subtitle && (
        <p className="text-xs text-[#8A857B] mt-1 font-normal leading-relaxed">{subtitle}</p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = 'p-6',
}) => <div className={className}>{children}</div>;
