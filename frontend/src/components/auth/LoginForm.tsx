import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { isValidIranianMobile } from '../../lib/phone';

interface LoginFormProps {
  onSubmit: (phone: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, loading, error }) => {
  const [phone, setPhone] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!phone.trim()) {
      setLocalError('لطفاً شماره موبایل عضویت خود را وارد فرمایید.');
      return;
    }

    if (!isValidIranianMobile(phone)) {
      setLocalError('شماره موبایل نامعتبر است. نمونه: ۰۹۱۲۳۴۵۶۷۸۹');
      return;
    }

    try {
      await onSubmit(phone);
    } catch {}
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {(error || localError) && (
        <Alert type="error">{error || localError}</Alert>
      )}

      <div className="space-y-3">
        <Input
          label="شماره موبایل ثبت‌شده در پرونده عضویت"
          type="tel"
          dir="ltr"
          className="text-left text-xl font-editorial font-semibold py-3 text-[#EDE8DF]"
          placeholder="0912 111 1111"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
          autoFocus
        />

        <div className="flex items-center justify-between text-[11px] text-[#8A857B] pt-1">
          <span>ارسال پیامک کد یک‌بارمصرف</span>
          <span className="text-[#C9A96A]/80 font-medium">احراز هویت پیامکی امن</span>
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={loading}
      >
        دریافت کد ورود
      </Button>
    </form>
  );
};
