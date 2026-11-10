import React, { useState } from 'react';

export function resolveAssetPath(relPath: string): string {
  const base = (window as any).proshotMC?.assetsUrl;
  if (base) {
    return `${base.replace(/\/$/, '')}/${relPath.replace(/^\//, '')}`;
  }
  const cleanPath = relPath.replace(/^\//, '');
  return `./assets/${cleanPath}`;
}

export function isPremiumBranch(branchSlug?: string | null, branchName?: string | null): boolean {
  return (
    branchSlug === 'premium' ||
    Boolean(branchName?.toLowerCase().includes('premium')) ||
    Boolean(branchName?.includes('پرمیوم')) ||
    Boolean(branchName?.includes('پریمیوم'))
  );
}

interface BrandLogoProps {
  branchSlug?: string | null;
  branchName?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  branchSlug,
  branchName,
  className = '',
  size = 'md',
  showSubtitle = false,
}) => {
  const isPremium = isPremiumBranch(branchSlug, branchName);
  const [imgError, setImgError] = useState(false);

  const heightClasses = {
    sm: 'h-5',
    md: 'h-7',
    lg: 'h-10',
    xl: 'h-13',
  };

  const primarySrc = isPremium
    ? resolveAssetPath('logo-premium.png')
    : resolveAssetPath('logo-standard.png');
  const fallbackSrc = isPremium ? '/logo-premium.png' : '/logo-standard.png';

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <img
        src={imgError ? fallbackSrc : primarySrc}
        alt={isPremium ? 'PROSHOT PREMIUM' : 'PROSHOT GYM'}
        className={`${heightClasses[size]} w-auto object-contain`}
        onError={() => {
          if (!imgError) {
            setImgError(true);
          }
        }}
      />

      {showSubtitle && (
        <div className="mt-2 text-center">
          <span
            className="eyebrow-latin"
            style={{ color: isPremium ? '#C9A96A' : '#B9BCC2' }}
          >
            {isPremium ? 'PRIVATE ATHLETIC CLUB' : 'ATHLETIC CLUB'}
          </span>
        </div>
      )}
    </div>
  );
};
