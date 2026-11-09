import React from 'react';
import { Membership } from '../../types/member';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface MembershipStatusProps {
  membership: Membership | null;
}

export const MembershipStatus: React.FC<MembershipStatusProps> = ({ membership }) => {
  if (!membership) {
    return (
      <Card className="p-6">
        <span className="eyebrow-latin block mb-1.5">MEMBERSHIP LEDGER</span>
        <h4 className="font-black text-[#EDE8DF] text-base mb-1">
          اشتراک فعالی ثبت نشده است
        </h4>
        <p className="text-xs text-[#8A857B] leading-relaxed">
          جهت تمدید عضویت یا فعال‌سازی دوره جدید، به پذیرش شعبه مراجعه فرمایید.
        </p>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (membership.status) {
      case 'active':
        return <Badge variant="success">اشتراک فعال</Badge>;
      case 'frozen':
        return <Badge variant="warning">فریز شده</Badge>;
      case 'suspended':
        return <Badge variant="danger">معلق</Badge>;
      case 'expired':
      default:
        return <Badge variant="danger">منقضی شده</Badge>;
    }
  };

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-[#EDE8DF]/[0.08]">
        <div>
          <span className="eyebrow-latin block mb-1">STATUS & VALIDITY</span>
          <h4 className="text-base font-black text-[#EDE8DF]">وضعیت پرونده عضویت</h4>
        </div>
        {getStatusBadge()}
      </div>

      {membership.is_active && (
        <div className="py-2 flex items-baseline justify-between border-b border-[#EDE8DF]/[0.08] pb-5">
          <div>
            <span className="text-xs text-[#8A857B] block mb-1">
              اعتبار باقیمانده دوره فعلی
            </span>
            <p className="text-3xl font-black text-[#EDE8DF]">
              {membership.days_remaining_persian}{' '}
              <span className="text-sm font-medium text-[#C9A96A]">روز</span>
            </p>
          </div>
          <span className="font-editorial italic text-sm text-[#C9A96A]" dir="ltr">
             Verified Pass
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 pt-1 text-xs">
        <div>
          <span className="eyebrow-latin block mb-1">COMMENCED</span>
          <span className="text-[11px] text-[#8A857B] block mb-0.5">شروع دوره</span>
          <span className="font-mono font-bold text-[#EDE8DF] text-sm">
            {membership.starts_at_jalali}
          </span>
        </div>
        <div className="border-r border-[#EDE8DF]/[0.08] pr-5">
          <span className="eyebrow-latin block mb-1">EXPIRATION</span>
          <span className="text-[11px] text-[#8A857B] block mb-0.5">پایان اعتبار</span>
          <span className="font-mono font-bold text-[#EDE8DF] text-sm">
            {membership.expires_at_jalali}
          </span>
        </div>
      </div>
    </Card>
  );
};
