import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface CheckinResultProps {
  data: {
    result: string;
    message: string;
    member?: any;
    attendance_id?: number;
  };
  onReset: () => void;
  onOverride?: () => void;
  canOverride?: boolean;
}

export const CheckinResult: React.FC<CheckinResultProps> = ({
  data,
  onReset,
  onOverride,
  canOverride = false,
}) => {
  const isApproved = data.result === 'approved' || data.result === 'override';

  return (
    <div
      className={`rounded-[3px] border p-7 sm:p-9 space-y-6 ${
        isApproved
          ? 'bg-[#0F1713] border-[#5E9E7E]/45 border-r-4 border-r-[#5E9E7E]'
          : 'bg-[#191011] border-[#B85A5A]/45 border-r-4 border-r-[#B85A5A]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-[#EDE8DF]/10 pb-5">
        <div>
          <span
            className="eyebrow-latin block mb-1.5"
            style={{ color: isApproved ? '#7BC49D' : '#DF8A8A' }}
          >
            {isApproved ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-[#EDE8DF]">
            {data.message}
          </h3>
        </div>

        <Badge variant={isApproved ? 'success' : 'danger'}>
          {isApproved ? 'مجوز ورود صادر شد' : 'عدم مجوز تردد'}
        </Badge>
      </div>

      {data.member && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2 border-b border-[#EDE8DF]/10 pb-5">
          <div>
            <span className="text-[11px] text-[#8A857B] block mb-1">نام عضو</span>
            <span className="text-lg font-black text-[#EDE8DF] block">
              {data.member.full_name}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#8A857B] block mb-1">شماره تماس</span>
            <span className="text-sm font-mono font-bold text-[#C9A96A] block" dir="ltr">
              {data.member.mobile}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
        {!isApproved && canOverride && onOverride && (
          <Button variant="tonal" size="md" onClick={onOverride}>
            صدور مجوز دستی (Override)
          </Button>
        )}

        <Button variant="primary" size="md" onClick={onReset}>
          پذیرش عضو بعدی
        </Button>
      </div>
    </div>
  );
};
