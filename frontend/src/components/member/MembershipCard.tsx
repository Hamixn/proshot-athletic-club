import React from 'react';
import { Membership, Member } from '../../types/member';
import { BrandLogo, isPremiumBranch } from '../ui/BrandLogo';

interface MembershipCardProps {
  member: Member | null;
  membership: Membership | null;
}

export const MembershipCard: React.FC<MembershipCardProps> = ({ member, membership }) => {
  const isPremium = isPremiumBranch(membership?.branch?.slug, membership?.branch?.name);
  const accentColor = isPremium ? '#C9A96A' : '#B9BCC2';
  const borderClass = isPremium
    ? 'border-[#C9A96A]/45 bg-[#101012]'
    : 'border-[#B9BCC2]/25 bg-[#121316]';

  return (
    <div
      className={`relative w-full aspect-[1.586/1] rounded-[8px] p-6 sm:p-7 flex flex-col justify-between overflow-hidden border select-none ${borderClass}`}
    >
      {/* Subtle Architectural Guilloche Line Pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.055]"
        viewBox="0 0 400 252"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path d="M-40 260 L220 -20" stroke={accentColor} strokeWidth="0.6" />
        <path d="M0 260 L260 -20" stroke={accentColor} strokeWidth="0.6" />
        <path d="M40 260 L300 -20" stroke={accentColor} strokeWidth="0.6" />
        <path d="M80 260 L340 -20" stroke={accentColor} strokeWidth="0.6" />
        <path d="M120 260 L380 -20" stroke={accentColor} strokeWidth="0.6" />
        <rect
          x="10"
          y="10"
          width="380"
          height="232"
          rx="4"
          stroke={accentColor}
          strokeWidth="0.5"
          strokeOpacity="0.5"
        />
      </svg>

      {/* Top Row: Official Branch Logo & Tier Monograph */}
      <div className="relative z-10 flex items-start justify-between gap-4">
        <BrandLogo
          branchSlug={membership?.branch?.slug}
          branchName={membership?.branch?.name}
          size="md"
        />

        <div className="text-left" dir="ltr">
          <span
            className="eyebrow-latin block"
            style={{ color: accentColor }}
          >
            {isPremium ? 'PRIVATE RESIDENCE' : 'ATHLETIC PASS'}
          </span>
          <span className="font-editorial italic text-sm text-[#EDE8DF]/80 block mt-0.5">
            No. {member?.external_id || 'PS-9902'}
          </span>
        </div>
      </div>

      {/* Middle Row: Member Identity & Plan */}
      <div className="relative z-10 my-auto py-2">
        <span className="eyebrow-latin block mb-1 text-[#8A857B]">
          MEMBER
        </span>
        <h3 className="text-2xl sm:text-[26px] font-black text-[#EDE8DF] leading-tight">
          {member?.full_name || 'عضو اختصاصی باشگاه'}
        </h3>
        <p
          className="text-xs font-medium mt-1"
          style={{ color: accentColor }}
        >
          {membership?.plan_name || 'طرح عضویت باشگاه پروشات'}
        </p>
      </div>

      {/* Bottom Row: Branch & Validity Hairline */}
      <div className="relative z-10 pt-3.5 border-t border-[#EDE8DF]/10 flex items-center justify-between gap-4 text-xs">
        <div>
          <span className="text-[10px] text-[#8A857B] block">شعبه اختصاصی</span>
          <span className="text-[#EDE8DF] font-bold mt-0.5 block">
            {membership?.branch?.name || 'تعیین نشده'}
          </span>
        </div>

        <div className="text-left">
          <span className="text-[10px] text-[#8A857B] block">اعتبار تا تاریخ</span>
          <span className="text-[#EDE8DF] font-mono font-bold mt-0.5 block">
            {membership?.expires_at_jalali || '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
