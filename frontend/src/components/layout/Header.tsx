import React from 'react';
import { BrandLogo, isPremiumBranch } from '../ui/BrandLogo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onLogout?: () => void;
  showLogout?: boolean;
  branchSlug?: string | null;
  branchName?: string | null;
  onBackToSite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  subtitle,
  onLogout,
  showLogout = false,
  branchSlug,
  branchName,
  onBackToSite,
}) => {
  const isPremium = isPremiumBranch(branchSlug, branchName);

  return (
    <header className="sticky top-0 z-40 bg-[#0A0A0B]/95 border-b border-[#EDE8DF]/12">
      <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <BrandLogo
            branchSlug={branchSlug}
            branchName={branchName}
            size="sm"
            className="shrink-0"
          />
          <span className="w-px h-5 bg-[#EDE8DF]/12 shrink-0" />
          <div className="min-w-0">
            <span
              className="text-[11px] font-extrabold block leading-none"
              style={{ color: isPremium ? '#C9A96A' : '#EDE8DF' }}
            >
              {isPremium ? 'پروشات پریمیوم — شیراز' : 'باشگاه‌های پروشات — شیراز'}
            </span>
            {subtitle && (
              <p className="text-xs text-[#8A857B] font-normal truncate mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onBackToSite && (
            <button
              type="button"
              onClick={onBackToSite}
              className="text-[11px] font-bold text-[#8A857B] hover:text-[#EDE8DF] transition-colors cursor-pointer"
            >
              صفحه اصلی
            </button>
          )}
          {showLogout && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="text-[11px] font-bold text-[#C9A96A] hover:underline transition-colors cursor-pointer"
            >
              خروج
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
