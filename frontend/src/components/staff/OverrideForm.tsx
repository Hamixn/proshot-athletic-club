import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface OverrideFormProps {
  memberId: number;
  branchId: number;
  onConfirm: (reason: string) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

export const OverrideForm: React.FC<OverrideFormProps> = ({
  onConfirm,
  onCancel,
  loading,
}) => {
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirm(reason.trim());
  };

  return (
    <Card variant="gold" className="p-7 space-y-5">
      <div className="border-b border-[#EDE8DF]/10 pb-4">
        <span className="eyebrow-latin text-[#C9A96A] block mb-1">
          EXECUTIVE OVERRIDE LOG
        </span>
        <h3 className="text-lg font-black text-[#EDE8DF]">
          ثبت مجوز تردد استثناء (Override)
        </h3>
        <p className="text-xs text-[#8A857B] mt-1 leading-relaxed">
          این مجوز در سجل امنیتی شعبه با نام کاربری شما ثبت می‌گردد. علت صدور مجوز را بنویسید:
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <textarea
          rows={3}
          className="w-full p-3.5 rounded-[2px] border border-[#EDE8DF]/15 bg-[#0A0A0B] text-[#EDE8DF] placeholder-[#57534B] text-xs focus:outline-none focus:border-[#C9A96A] transition-colors leading-relaxed resize-none"
          placeholder="مثال: تأیید هویت با کارت فیزیکی عضویت / هماهنگی مدیریت شعبه..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        <div className="flex items-center gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={!reason.trim()}
          >
            تأیید و ثبت ورود
          </Button>
        </div>
      </form>
    </Card>
  );
};
